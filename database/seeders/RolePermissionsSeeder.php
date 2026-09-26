<?php

namespace Database\Seeders;

use App\Enums\PermissionsEnum;
use App\Enums\RolesEnum;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class RolePermissionsSeeder extends Seeder
{
    public function run(): void
    {
        foreach (PermissionsEnum::cases() as $case) {
            Permission::firstOrCreate(['name' => $case->value]);
        }

        $superAdminRole = Role::firstOrCreate([
            'name' => RolesEnum::SuperAdmin->value,
            'label' => 'Super Admin',
        ]);

        $accountOwnerRole = Role::firstOrCreate([
            'name' => RolesEnum::AccountOwner->value,
            'label' => 'Account Owner',
        ]);

        Role::firstOrCreate([
            'name' => RolesEnum::TeamMember->value,
            'label' => 'Team Member',
        ]);

        $superAdminRole->syncPermissions([
            PermissionsEnum::ManageTenants->value,
            PermissionsEnum::ImpersonateTenants->value,
            PermissionsEnum::ViewPlatformMetrics->value,
        ]);

        $accountOwnerRole->syncPermissions([
            PermissionsEnum::ManageSubscription->value,
            PermissionsEnum::ManageTeam->value,
            PermissionsEnum::ViewDashboard->value,
        ]);
        // team_member role has no default permissions — they are granted per-invitation
    }
}
