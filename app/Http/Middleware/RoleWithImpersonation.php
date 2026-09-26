<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Spatie\Permission\Middleware\RoleMiddleware;

class RoleWithImpersonation extends RoleMiddleware
{
    /**
     * Impersonation sessions expire after this many seconds of being set.
     */
    private const IMPERSONATION_TTL = 1800; // 30 minutes

    public function handle(Request $request, Closure $next, $role, ?string $guard = null)
    {
        if ($request->user()?->tenant_id === null && session()->has('impersonated_tenant_id')) {
            if ($this->impersonationExpired()) {
                session()->forget(['impersonated_tenant_id', 'impersonated_tenant_name', 'impersonated_at']);

                return parent::handle($request, $next, $role, $guard);
            }

            $request->attributes->set('is_impersonating', true);
            $request->user()->tenant_id = (int) session('impersonated_tenant_id');

            return $next($request);
        }

        return parent::handle($request, $next, $role, $guard);
    }

    private function impersonationExpired(): bool
    {
        $startedAt = session('impersonated_at');

        return $startedAt === null || (now()->timestamp - (int) $startedAt) > self::IMPERSONATION_TTL;
    }
}
