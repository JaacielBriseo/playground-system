<?php

namespace App\Services;

use App\DTOs\Users\CreateUserData;
use App\DTOs\Users\UpdateUserData;
use App\Exceptions\KnownException;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class UserService
{
    public function create(CreateUserData $data): User
    {
        try {
            DB::beginTransaction();

            $user = User::create([
                'name'     => $data->name,
                'email'    => $data->email,
                'password' => Hash::make($data->password),
            ]);

            if ($data->roles !== null) {
                $user->syncRoles($data->roles);
            }

            DB::commit();

            return $user->load(['permissions', 'roles']);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error($e);
            throw $e;
        }
    }

    public function update(User $user, UpdateUserData $data): User
    {
        try {
            DB::beginTransaction();

            if ($data->isProvided('name')) {
                $user->name = $data->name;
            }
            if ($data->isProvided('email')) {
                $user->email = $data->email;
            }
            if ($data->isProvided('password') && ! empty($data->password)) {
                $user->password = Hash::make($data->password);
            }

            $user->save();

            if ($data->isProvided('roles') && $data->roles !== null) {
                $user->syncRoles($data->roles);
            }

            DB::commit();

            return $user->load(['permissions', 'roles']);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error($e);
            throw $e;
        }
    }

    public function delete(User $user, int $actingUserId): void
    {
        if ($user->id === $actingUserId) {
            throw new KnownException('You cannot delete your own account.');
        }

        $user->delete();
    }
}
