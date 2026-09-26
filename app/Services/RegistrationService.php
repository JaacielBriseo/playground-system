<?php

namespace App\Services;

use App\Enums\RolesEnum;
use App\Models\Team;
use App\Models\TeamMember;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class RegistrationService
{
    public function register(string $name, string $email, string $password): array
    {
        try {
            DB::beginTransaction();

            $tenant = Tenant::create(['name' => $name]);

            $user = new User([
                'name'     => $name,
                'email'    => $email,
                'password' => Hash::make($password),
            ]);
            $user->tenant_id = $tenant->id;
            $user->save();
            $user->assignRole(RolesEnum::AccountOwner);

            $team = Team::create([
                'name'        => $tenant->name,
                'slug'        => Str::slug($tenant->name),
                'is_personal' => true,
            ]);

            TeamMember::create([
                'team_id' => $team->id,
                'user_id' => $user->id,
                'role'    => 'owner',
            ]);

            DB::commit();

            return ['user' => $user, 'tenant' => $tenant];
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error($e);
            throw $e;
        }
    }
}
