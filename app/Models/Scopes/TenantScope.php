<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class TenantScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        if (! auth()->hasUser()) {
            return;
        }

        $user = auth()->user();

        // Super admins (tenant_id = null) may impersonate a tenant via session
        $tenantId = ($user->tenant_id === null && session()->has('impersonated_tenant_id'))
            ? session('impersonated_tenant_id')
            : $user->tenant_id;

        if ($tenantId !== null) {
            $builder->where($model->qualifyColumn('tenant_id'), $tenantId);
        }
    }
}
