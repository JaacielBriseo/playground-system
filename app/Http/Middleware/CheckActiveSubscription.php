<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckActiveSubscription
{
    public function handle(Request $request, Closure $next): Response
    {
        // Super admin impersonating a tenant bypasses subscription checks entirely.
        if ($request->attributes->get('is_impersonating')) {
            return $next($request);
        }

        $tenant = $request->user()?->loadMissing('tenant')->tenant;

        if (! $tenant || $tenant->status === 'suspended' || ! $tenant->subscribed('default')) {
            if ($request->expectsJson()) {
                return response()->json([
                    'ok'      => false,
                    'message' => __('Your subscription is inactive. Reactivate your account to continue.'),
                    'errors'  => (object) [],
                ], 402);
            }

            return redirect()->route('subscription.inactive');
        }

        return $next($request);
    }
}
