<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Resources\TenantResource;
use App\Models\Tenant;
use App\Services\TenantService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TenantsController extends Controller
{
    public function __construct(private readonly TenantService $service) {}

    public function index(Request $request): Response
    {
        $tenants = Tenant::query()
            ->with('subscriptions')
            ->withCount('users')
            ->search($request->string('search')->toString(), ['name'])
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 25));

        return Inertia::render('super-admin/tenants/index', [
            'tenants' => TenantResource::collection($tenants)->additional([
                'total_count' => $tenants->total(),
            ]),
        ]);
    }

    public function suspend(Tenant $tenant): RedirectResponse
    {
        $this->service->suspend($tenant);

        return back()->with('success', __('Tenant ":name" suspended.', ['name' => $tenant->name]));
    }

    public function reactivate(Tenant $tenant): RedirectResponse
    {
        $this->service->reactivate($tenant);

        return back()->with('success', __('Tenant ":name" reactivated.', ['name' => $tenant->name]));
    }
}
