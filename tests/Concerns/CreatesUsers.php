<?php

namespace Tests\Concerns;

use App\Enums\RolesEnum;
use App\Models\User;

trait CreatesUsers
{
    protected function superAdmin(): User
    {
        $user = User::factory()->create();
        $user->assignRole(RolesEnum::SuperAdmin->value);

        return $user->fresh();
    }

    protected function regularUser(): User
    {
        $user = User::factory()->create();
        $user->assignRole(RolesEnum::User->value);

        return $user->fresh();
    }
}
