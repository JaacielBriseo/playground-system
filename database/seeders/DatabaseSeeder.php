<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\RolesEnum;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->environment('production')) {
            Log::warning('Seeding in production environment is disabled.');

            return;
        }

        $this->call([
            RolePermissionsSeeder::class,
        ]);

        User::factory()->create([
            'name'  => 'Super Admin',
            'email' => 'superadmin@example.com',
        ])->assignRole(RolesEnum::SuperAdmin);

        User::factory()->create([
            'name'  => 'Demo User',
            'email' => 'user@example.com',
        ])->assignRole(RolesEnum::User);
    }
}
