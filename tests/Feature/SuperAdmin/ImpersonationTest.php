<?php

namespace Tests\Feature\SuperAdmin;

use Database\Seeders\RolePermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesTenants;
use Tests\TestCase;

/**
 * Support sessions: a super admin can enter a tenant to reproduce a problem.
 * Because that is a privileged, audited action, this test pins the whole
 * lifecycle — entry, session state, expiry and audit trail.
 */
class ImpersonationTest extends TestCase
{
    use CreatesTenants;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionsSeeder::class);
    }

    public function test_super_admin_can_start_a_support_session(): void
    {
        [$tenant] = $this->subscribedTenant();

        $this->actingAs($this->superAdmin())
            ->post(route('super-admin.tenants.impersonate', $tenant))
            ->assertRedirect(route('admin.index'));

        $this->assertEquals($tenant->id, session('impersonated_tenant_id'));
        $this->assertEquals($tenant->name, session('impersonated_tenant_name'));
        $this->assertNotNull(session('impersonated_at'));
    }

    public function test_starting_and_stopping_are_both_audited(): void
    {
        [$tenant] = $this->subscribedTenant();
        $admin = $this->superAdmin();

        $this->actingAs($admin)->post(route('super-admin.tenants.impersonate', $tenant));
        $this->actingAs($admin)->post(route('super-admin.impersonation.stop'));

        $this->assertDatabaseHas('activity_log', [
            'log_name'     => 'impersonation',
            'description'  => 'started',
            'subject_id'   => $tenant->id,
            'causer_id'    => $admin->id,
        ]);

        $this->assertDatabaseHas('activity_log', [
            'log_name'    => 'impersonation',
            'description' => 'stopped',
            'subject_id'  => $tenant->id,
        ]);
    }

    public function test_stopping_clears_the_whole_session(): void
    {
        [$tenant] = $this->subscribedTenant();
        $admin = $this->superAdmin();

        $this->actingAs($admin)->post(route('super-admin.tenants.impersonate', $tenant));

        $this->actingAs($admin)
            ->post(route('super-admin.impersonation.stop'))
            ->assertRedirect(route('super-admin.tenants.index'));

        $this->assertNull(session('impersonated_tenant_id'));
        $this->assertNull(session('impersonated_tenant_name'));
        $this->assertNull(session('impersonated_at'));
    }

    /** While impersonating, the super admin can use the tenant application. */
    public function test_impersonating_admin_can_reach_the_tenant_app(): void
    {
        [$tenant] = $this->subscribedTenant();

        $this->actingAs($this->superAdmin())
            ->withSession([
                'impersonated_tenant_id'   => $tenant->id,
                'impersonated_tenant_name' => $tenant->name,
                'impersonated_at'          => now()->timestamp,
            ])
            ->get('/admin')
            ->assertOk();
    }

    /**
     * An unsubscribed tenant would normally be locked out, but support needs to
     * get in precisely when billing is broken — CheckActiveSubscription lets
     * impersonated requests through.
     */
    public function test_impersonation_bypasses_the_subscription_gate(): void
    {
        [$tenant] = $this->unsubscribedTenant();

        $this->actingAs($this->superAdmin())
            ->withSession([
                'impersonated_tenant_id'   => $tenant->id,
                'impersonated_tenant_name' => $tenant->name,
                'impersonated_at'          => now()->timestamp,
            ])
            ->get('/admin')
            ->assertOk();
    }

    /** Sessions self-expire after 30 minutes so nobody stays in by accident. */
    public function test_session_expires_after_the_ttl(): void
    {
        [$tenant] = $this->subscribedTenant();

        $this->actingAs($this->superAdmin())
            ->withSession([
                'impersonated_tenant_id'   => $tenant->id,
                'impersonated_tenant_name' => $tenant->name,
                'impersonated_at'          => now()->subMinutes(31)->timestamp,
            ])
            // Falls back to the plain role check, which a super admin fails
            // for an account_owner route.
            ->get('/admin')
            ->assertForbidden();
    }

    public function test_account_owners_cannot_impersonate(): void
    {
        [$tenantA, $owner] = $this->subscribedTenant();
        [$tenantB] = $this->subscribedTenant();

        $this->actingAs($owner)
            ->post(route('super-admin.tenants.impersonate', $tenantB))
            ->assertForbidden();

        $this->assertNull(session('impersonated_tenant_id'));
    }
}
