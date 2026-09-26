<?php

namespace Tests\Feature\Billing;

use Database\Seeders\RolePermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesTenants;
use Tests\TestCase;

/**
 * The commercial boundary: no active subscription means no access to the tenant
 * application. Enforced once, in App\Http\Middleware\CheckActiveSubscription.
 */
class SubscriptionGateTest extends TestCase
{
    use CreatesTenants;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionsSeeder::class);
    }

    public function test_subscribed_tenant_reaches_the_app(): void
    {
        [, $user] = $this->subscribedTenant();

        $this->actingAs($user)->get('/admin')->assertOk();
    }

    public function test_trialing_tenant_reaches_the_app(): void
    {
        [, $user] = $this->subscribedTenant('trialing');

        $this->actingAs($user)->get('/admin')->assertOk();
    }

    public function test_unsubscribed_tenant_is_redirected_to_the_reactivation_page(): void
    {
        [, $user] = $this->unsubscribedTenant();

        $this->actingAs($user)
            ->get('/admin')
            ->assertRedirect(route('subscription.inactive'));
    }

    public function test_unsubscribed_tenant_gets_402_on_json_endpoints(): void
    {
        [, $user] = $this->unsubscribedTenant();

        $this->actingAs($user)
            ->postJson('/api/admin/team/invite', ['email' => 'someone@example.com'])
            ->assertStatus(402)
            ->assertJson(['ok' => false]);
    }

    public function test_lapsed_cancellation_locks_the_tenant_out(): void
    {
        [, $user] = $this->subscribedTenant('canceled', now()->subDay());

        $this->actingAs($user)
            ->get('/admin')
            ->assertRedirect(route('subscription.inactive'));
    }

    /**
     * Cashier judges validity by ends_at, not stripe_status. Someone who
     * cancelled but has paid through the end of the period keeps access until
     * that date — losing it early would be charging for nothing.
     */
    public function test_cancelled_subscription_still_works_during_the_grace_period(): void
    {
        [, $user] = $this->subscribedTenant('canceled', now()->addDays(5));

        $this->actingAs($user)->get('/admin')->assertOk();
    }

    public function test_past_due_subscription_locks_the_tenant_out(): void
    {
        [, $user] = $this->subscribedTenant('past_due');

        $this->actingAs($user)
            ->get('/admin')
            ->assertRedirect(route('subscription.inactive'));
    }

    /**
     * A super admin suspension overrides a perfectly good subscription — the
     * two checks are independent and both must pass.
     */
    public function test_suspended_tenant_is_locked_out_despite_an_active_subscription(): void
    {
        [$tenant, $user] = $this->subscribedTenant();
        $tenant->update(['status' => 'suspended']);

        $this->actingAs($user)
            ->get('/admin')
            ->assertRedirect(route('subscription.inactive'));
    }

    /**
     * Billing routes must stay OUTSIDE the gate, otherwise a lapsed tenant
     * could never reach the page that lets them pay.
     */
    public function test_unsubscribed_tenant_can_still_reach_the_checkout_page(): void
    {
        [, $user] = $this->unsubscribedTenant();

        $this->actingAs($user)->get('/subscription/checkout')->assertOk();
    }

    public function test_guests_are_sent_to_login(): void
    {
        $this->get('/admin')->assertRedirect('/login');
    }
}
