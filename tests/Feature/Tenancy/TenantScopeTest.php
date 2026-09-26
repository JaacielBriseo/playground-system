<?php

namespace Tests\Feature\Tenancy;

use Database\Seeders\RolePermissionsSeeder;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\Concerns\CreatesTenants;
use Tests\Fixtures\ScopedFixture;
use Tests\TestCase;

/**
 * Pins the isolation mechanism the whole template rests on: the global scope in
 * App\Models\Scopes\TenantScope, applied via the HasTenantScope trait.
 *
 * Read the "no authenticated user" test carefully — that behaviour is a
 * deliberate design decision with real consequences for queue jobs, scheduled
 * commands, webhook handlers and seeders. See docs/ARCHITECTURE.md §7.
 */
class TenantScopeTest extends TestCase
{
    use CreatesTenants;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionsSeeder::class);

        Schema::create('scoped_fixtures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('name');
        });
    }

    public function test_queries_are_filtered_to_the_authenticated_users_tenant(): void
    {
        [$tenantA, $userA] = $this->subscribedTenant();
        [$tenantB] = $this->subscribedTenant();

        ScopedFixture::create(['tenant_id' => $tenantA->id, 'name' => 'mine']);
        ScopedFixture::create(['tenant_id' => $tenantB->id, 'name' => 'theirs']);

        $this->actingAs($userA);

        $this->assertSame(['mine'], ScopedFixture::pluck('name')->all());
    }

    public function test_another_tenants_record_is_invisible_even_by_id(): void
    {
        [, $userA] = $this->subscribedTenant();
        [$tenantB] = $this->subscribedTenant();

        $theirs = ScopedFixture::create(['tenant_id' => $tenantB->id, 'name' => 'theirs']);

        $this->actingAs($userA);

        // This is what makes route-model binding 404 rather than leak.
        $this->assertNull(ScopedFixture::find($theirs->id));
    }

    /**
     * The scope no-ops when nobody is authenticated.
     *
     * This is intentional — queue jobs and Stripe webhooks legitimately need to
     * reach across tenants — but it means code in those contexts MUST filter by
     * tenant_id itself. This test exists so that contract stays visible.
     */
    public function test_scope_is_inactive_without_an_authenticated_user(): void
    {
        [$tenantA] = $this->subscribedTenant();
        [$tenantB] = $this->subscribedTenant();

        ScopedFixture::create(['tenant_id' => $tenantA->id, 'name' => 'a']);
        ScopedFixture::create(['tenant_id' => $tenantB->id, 'name' => 'b']);

        $this->assertGuest();
        $this->assertCount(2, ScopedFixture::all());
    }

    /**
     * A super admin has tenant_id = null, so the scope no-ops for them too.
     * That is what lets the platform console see every tenant.
     */
    public function test_scope_is_inactive_for_super_admins(): void
    {
        [$tenantA] = $this->subscribedTenant();
        [$tenantB] = $this->subscribedTenant();

        ScopedFixture::create(['tenant_id' => $tenantA->id, 'name' => 'a']);
        ScopedFixture::create(['tenant_id' => $tenantB->id, 'name' => 'b']);

        $this->actingAs($this->superAdmin());

        $this->assertCount(2, ScopedFixture::all());
    }

    /** While impersonating, a super admin sees exactly that tenant's data. */
    public function test_impersonating_super_admin_is_scoped_to_the_impersonated_tenant(): void
    {
        [$tenantA] = $this->subscribedTenant();
        [$tenantB] = $this->subscribedTenant();

        ScopedFixture::create(['tenant_id' => $tenantA->id, 'name' => 'a']);
        ScopedFixture::create(['tenant_id' => $tenantB->id, 'name' => 'b']);

        $this->actingAs($this->superAdmin());
        session(['impersonated_tenant_id' => $tenantB->id]);

        $this->assertSame(['b'], ScopedFixture::pluck('name')->all());
    }

    /** tenant_id must come from the session/user, never from client input. */
    public function test_a_team_member_is_scoped_to_their_owners_tenant(): void
    {
        [$tenantA] = $this->subscribedTenant();
        [$tenantB] = $this->subscribedTenant();

        ScopedFixture::create(['tenant_id' => $tenantA->id, 'name' => 'a']);
        ScopedFixture::create(['tenant_id' => $tenantB->id, 'name' => 'b']);

        $this->actingAs($this->teamMemberFor($tenantA));

        $this->assertSame(['a'], ScopedFixture::pluck('name')->all());
    }
}
