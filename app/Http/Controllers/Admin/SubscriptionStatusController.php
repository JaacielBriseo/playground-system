<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\TenantResource;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionStatusController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $tenant = $request->user()->tenant->loadMissing('subscriptions');

        return Inertia::render('admin/subscription', [
            'tenant' => new TenantResource($tenant),
        ]);
    }
}
