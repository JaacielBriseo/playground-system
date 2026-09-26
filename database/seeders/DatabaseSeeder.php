<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\RolesEnum;
use App\Models\Team;
use App\Models\TeamMember;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

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

        // Platform operator. tenant_id stays null — that is what makes
        // TenantScope a no-op for this user and lets them impersonate.
        User::factory()->superAdmin()->create([
            'name'  => 'Super Admin',
            'email' => 'superadmin@example.com',
        ])->assignRole(RolesEnum::SuperAdmin);

        // One demo tenant with its owner, mirroring what RegistrationService
        // builds when somebody signs up.
        $tenant = Tenant::create(['name' => 'Acme Inc.']);

        $owner = User::factory()->create([
            'tenant_id' => $tenant->id,
            'name'      => 'Account Owner',
            'email'     => 'owner@example.com',
        ])->assignRole(RolesEnum::AccountOwner);

        $team = Team::create([
            'name'        => $tenant->name,
            'slug'        => Str::slug($tenant->name),
            'is_personal' => true,
        ]);

        TeamMember::create([
            'team_id' => $team->id,
            'user_id' => $owner->id,
            'role'    => 'owner',
        ]);

        // No subscription is seeded on purpose. Both accounts start unsubscribed,
        // so the first thing you exercise is the real Stripe Checkout flow: the
        // owner lands on /subscription/inactive until they subscribe.
    }
}
