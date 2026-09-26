<?php

namespace App\Services;

use App\Models\Tenant;

class TenantService
{
    public function suspend(Tenant $tenant): void
    {
        $tenant->update(['status' => 'suspended']);
    }

    public function reactivate(Tenant $tenant): void
    {
        $tenant->update(['status' => 'active']);
    }
}
