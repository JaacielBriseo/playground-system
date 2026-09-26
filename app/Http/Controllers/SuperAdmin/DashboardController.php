<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('super-admin/index', [
            'metrics' => $this->metrics(),
        ]);
    }

    /**
     * Platform-wide counts. These stay meaningful for any product built on this
     * template — everything here comes from the tenants/subscriptions tables,
     * never from domain data.
     *
     * @return array<string, int>
     */
    private function metrics(): array
    {
        // A tenant accumulates several subscription rows over its lifetime,
        // so count distinct tenants rather than rows.
        $tenantsWithStatus = fn (array $statuses): int => (int) DB::table('subscriptions')
            ->where('type', 'default')
            ->whereIn('stripe_status', $statuses)
            ->distinct()
            ->count('tenant_id');

        return [
            'tenants'              => Tenant::count(),
            'active_subscriptions' => $tenantsWithStatus(['active']),
            'trialing'             => $tenantsWithStatus(['trialing']),
            'past_due'             => $tenantsWithStatus(['past_due', 'unpaid']),
            'suspended'            => Tenant::where('status', 'suspended')->count(),
            'signups_this_month'   => Tenant::where('created_at', '>=', now()->startOfMonth())->count(),
            // Excludes super admins, who carry no tenant_id.
            'users' => User::withoutGlobalScopes()->whereNotNull('tenant_id')->count(),
        ];
    }
}
