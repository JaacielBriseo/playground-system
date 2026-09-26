<?php

namespace Tests\Feature\Team;

use App\Enums\RolesEnum;
use App\Mail\TeamInvitationMail;
use App\Models\TeamInvitation;
use App\Models\TeamMember;
use App\Models\User;
use Database\Seeders\RolePermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\Concerns\CreatesTenants;
use Tests\TestCase;

/**
 * The seat-filling path: an owner invites someone, they accept, and they land
 * inside the owner's tenant. The critical assertion is the last one — an
 * accepted invitation must not create a new tenant.
 */
class InvitationTest extends TestCase
{
    use CreatesTenants;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionsSeeder::class);
        Mail::fake();
    }

    public function test_owner_can_invite_someone(): void
    {
        [, $owner] = $this->subscribedTenant();

        $this->actingAs($owner)
            ->postJson('/api/admin/team/invite', ['email' => 'newbie@example.com'])
            ->assertSuccessful()
            ->assertJson(['ok' => true]);

        $this->assertDatabaseHas('team_invitations', [
            'email'      => 'newbie@example.com',
            'role'       => 'member',
            'invited_by' => $owner->id,
        ]);

        // TeamInvitationMail implements ShouldQueue, so it is queued rather
        // than sent inline.
        Mail::assertQueued(TeamInvitationMail::class);
    }

    public function test_accepting_an_invitation_joins_the_inviters_tenant(): void
    {
        [$tenant, $owner] = $this->subscribedTenant();

        $this->actingAs($owner)->postJson('/api/admin/team/invite', ['email' => 'newbie@example.com']);
        $invitation = TeamInvitation::firstOrFail();

        // The accept route is behind `guest`; the invitee is not the inviter.
        // forgetGuards() drops the actingAs() user set above (the default guard
        // is Sanctum's RequestGuard, which has no logout()).
        auth()->forgetGuards();

        $this->post(route('invitation.accept', $invitation->token), [
            'name'                  => 'New Bie',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $member = User::where('email', 'newbie@example.com')->firstOrFail();

        // The whole point: same tenant as the inviter, not a fresh one.
        $this->assertSame($tenant->id, $member->tenant_id);
        $this->assertTrue($member->hasRole(RolesEnum::TeamMember->value));
        $this->assertDatabaseHas('team_members', [
            'user_id' => $member->id,
            'role'    => 'member',
        ]);
        $this->assertNotNull($invitation->fresh()->accepted_at);
    }

    public function test_a_team_member_cannot_manage_the_team(): void
    {
        [$tenant] = $this->subscribedTenant();
        $member = $this->teamMemberFor($tenant);

        // Team management is account_owner only.
        $this->actingAs($member)
            ->postJson('/api/admin/team/invite', ['email' => 'another@example.com'])
            ->assertForbidden();

        $this->actingAs($member)->get('/admin/team')->assertForbidden();
    }

    public function test_owner_cannot_remove_themselves(): void
    {
        [, $owner] = $this->subscribedTenant();

        $this->actingAs($owner)
            ->deleteJson("/api/admin/team/members/{$owner->id}")
            ->assertStatus(422)
            ->assertJson(['ok' => false]);

        $this->assertDatabaseHas('team_members', ['user_id' => $owner->id, 'role' => 'owner']);
    }

    public function test_removing_a_member_detaches_them_from_the_tenant(): void
    {
        [$tenant, $owner] = $this->subscribedTenant();
        $member = $this->teamMemberFor($tenant);

        $this->actingAs($owner)
            ->deleteJson("/api/admin/team/members/{$member->id}")
            ->assertSuccessful();

        $member->refresh();

        $this->assertNull($member->tenant_id);
        $this->assertFalse($member->hasRole(RolesEnum::TeamMember->value));
        $this->assertSame(0, TeamMember::where('user_id', $member->id)->count());
    }

    public function test_invitations_require_a_valid_email(): void
    {
        [, $owner] = $this->subscribedTenant();

        $this->actingAs($owner)
            ->postJson('/api/admin/team/invite', ['email' => 'not-an-email'])
            ->assertStatus(422);

        $this->assertDatabaseCount('team_invitations', 0);
    }
}
