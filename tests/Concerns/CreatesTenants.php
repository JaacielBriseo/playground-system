<?php

namespace Tests\Concerns;

use App\Enums\RolesEnum;
use App\Models\Team;
use App\Models\TeamMember;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Str;

/**
 * Builders for the two shapes every test in this suite needs: a paying tenant
 * and a platform operator.
 *
 * Subscriptions are written straight to the table rather than through Cashier,
 * so nothing here touches the Stripe API.
 */
trait CreatesTenants
{
    /**
     * A tenant with a subscription, its account owner, and a personal team —
     * the same shape RegistrationService produces on signup.
     *
     * Note that Cashier decides "is this still valid?" from `ends_at`, not from
     * `stripe_status`: a row marked 'canceled' with a null ends_at still counts
     * as subscribed. Real cancellations always set ends_at, so pass it when you
     * want to model one.
     *
     * @return array{0: Tenant, 1: User}
     */
    protected function subscribedTenant(string $stripeStatus = 'active', ?\DateTimeInterface $endsAt = null): array
    {
        $tenant = Tenant::factory()->create(['status' => 'active']);

        $tenant->subscriptions()->create([
            'type'          => 'default',
            'stripe_id'     => 'sub_' . Str::random(20),
            'stripe_status' => $stripeStatus,
            'stripe_price'  => 'price_test',
            'quantity'      => 1,
            'ends_at'       => $endsAt,
        ]);

        $user = $this->ownerFor($tenant);

        return [$tenant, $user];
    }

    /**
     * A tenant that has never subscribed. Its owner is locked out by
     * CheckActiveSubscription.
     *
     * @return array{0: Tenant, 1: User}
     */
    protected function unsubscribedTenant(): array
    {
        $tenant = Tenant::factory()->create(['status' => 'active']);

        return [$tenant, $this->ownerFor($tenant)];
    }

    /** Platform operator: no tenant_id, so TenantScope no-ops for them. */
    protected function superAdmin(): User
    {
        $user = User::factory()->superAdmin()->create();
        $user->assignRole(RolesEnum::SuperAdmin->value);

        return $user->fresh();
    }

    /** Add a second, non-owner user to an existing tenant. */
    protected function teamMemberFor(Tenant $tenant): User
    {
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $user->assignRole(RolesEnum::TeamMember->value);

        // Find the tenant's team via its owner rather than by slug, which
        // ownerFor() suffixes to keep the unique index happy.
        $ownerId = User::where('tenant_id', $tenant->id)->pluck('id');
        $team = TeamMember::whereIn('user_id', $ownerId)->where('role', 'owner')->value('team_id');

        if ($team) {
            TeamMember::create([
                'team_id' => $team,
                'user_id' => $user->id,
                'role'    => 'member',
            ]);
        }

        return $user->fresh();
    }

    private function ownerFor(Tenant $tenant): User
    {
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $user->assignRole(RolesEnum::AccountOwner->value);

        $team = Team::create([
            'name'        => $tenant->name,
            'slug'        => Str::slug($tenant->name) . '-' . Str::random(6),
            'is_personal' => true,
        ]);

        TeamMember::create([
            'team_id' => $team->id,
            'user_id' => $user->id,
            'role'    => 'owner',
        ]);

        // Re-hydrate so every column is present for strict attribute access
        // in the shared Inertia props.
        return $user->fresh();
    }
}
