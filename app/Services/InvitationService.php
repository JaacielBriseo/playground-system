<?php

namespace App\Services;

use App\Enums\RolesEnum;
use App\Exceptions\KnownException;
use App\Models\TeamInvitation;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class InvitationService
{
    public function accept(TeamInvitation $invitation, string $name, string $password): User
    {
        try {
            DB::beginTransaction();

            $owner = TeamMember::with('user')
                ->where('team_id', $invitation->team_id)
                ->where('role', 'owner')
                ->firstOrFail();

            if ($owner->user === null) {
                throw new KnownException(__('The team owner account could not be found.'), 422);
            }

            $ownerTenantId = $owner->user->tenant_id;

            $user = new User([
                'name'     => $name,
                'email'    => $invitation->email,
                'password' => Hash::make($password),
            ]);
            $user->tenant_id = $ownerTenantId;
            $user->email_verified_at = now();
            $user->save();

            $user->assignRole(RolesEnum::TeamMember->value);

            TeamMember::create([
                'team_id' => $invitation->team_id,
                'user_id' => $user->id,
                'role'    => 'member',
            ]);

            $invitation->update(['accepted_at' => now()]);

            DB::commit();

            return $user;
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error($e);
            throw $e;
        }
    }
}
