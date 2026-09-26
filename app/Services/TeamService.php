<?php

namespace App\Services;

use App\Enums\RolesEnum;
use App\Exceptions\KnownException;
use App\Mail\TeamInvitationMail;
use App\Models\Team;
use App\Models\TeamInvitation;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class TeamService
{
    public function invite(Team $team, string $email, int $invitedBy): TeamInvitation
    {
        try {
            DB::beginTransaction();

            $invitation = $team->invitations()->create([
                'email'      => $email,
                'token'      => bin2hex(random_bytes(32)),
                'role'       => 'member',
                'invited_by' => $invitedBy,
                'expires_at' => now()->addDays(7),
            ]);

            // Signup creates a personal (solo) team. The moment an owner invites
            // somebody it stops being personal, which is what surfaces the team
            // block in the sidebar and the members table.
            if ($team->is_personal) {
                $team->update(['is_personal' => false]);
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error($e);
            throw $e;
        }

        $invitation->load('team', 'inviter');

        $acceptUrl = route('invitation.show', $invitation->token);

        try {
            Mail::to($invitation->email)->send(new TeamInvitationMail($invitation, $acceptUrl));
        } catch (\Throwable $e) {
            $invitation->delete();
            Log::error($e);
            throw $e;
        }

        return $invitation;
    }

    public function removeMember(Team $team, User $memberToRemove, User $actor): void
    {
        if ($memberToRemove->id === $actor->id) {
            throw new KnownException(__('You cannot remove yourself from the team.'), 422);
        }

        $member = $team->members()->where('user_id', $memberToRemove->id)->firstOrFail();

        if ($member->role === 'owner') {
            throw new KnownException(__('The team owner cannot be removed.'), 422);
        }

        try {
            DB::beginTransaction();

            $member->delete();
            $team->invitations()->pending()->where('email', $memberToRemove->email)->delete();
            $memberToRemove->removeRole(RolesEnum::TeamMember->value);
            $memberToRemove->syncPermissions([]);
            $memberToRemove->tenant_id = null;
            $memberToRemove->save();

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error($e);
            throw $e;
        }
    }

    public function cancelInvitation(TeamInvitation $invitation): void
    {
        $invitation->delete();
    }

    public function resendInvitation(TeamInvitation $invitation): void
    {
        try {
            DB::beginTransaction();
            $invitation->update(['expires_at' => now()->addDays(7)]);
            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error($e);
            throw $e;
        }

        $invitation->load('team', 'inviter');
        $acceptUrl = route('invitation.show', $invitation->token);
        Mail::to($invitation->email)->send(new TeamInvitationMail($invitation, $acceptUrl));
    }
}
