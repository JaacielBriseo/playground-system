<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;

class ImpersonationController extends Controller
{
    public function impersonate(Tenant $tenant): RedirectResponse
    {
        Log::info('Impersonation started', ['admin_id' => auth()->id(), 'tenant_id' => $tenant->id]);

        session()->put('impersonated_tenant_id', $tenant->id);
        session()->put('impersonated_tenant_name', $tenant->name);
        session()->put('impersonated_at', now()->timestamp);

        $this->audit('started', $tenant);

        return redirect()->route('admin.index');
    }

    public function stop(): RedirectResponse
    {
        $tenantId = session('impersonated_tenant_id');
        Log::info('Impersonation stopped', ['admin_id' => auth()->id(), 'tenant_id' => $tenantId]);

        if ($tenantId && $tenant = Tenant::find($tenantId)) {
            $this->audit('stopped', $tenant);
        }

        session()->forget(['impersonated_tenant_id', 'impersonated_tenant_name', 'impersonated_at']);

        return redirect()->route('super-admin.tenants.index');
    }

    private function audit(string $event, Tenant $tenant): void
    {
        try {
            activity('impersonation')
                ->causedBy(auth()->user())
                ->performedOn($tenant)
                ->log($event);
        } catch (\Throwable) {
        }
    }
}
