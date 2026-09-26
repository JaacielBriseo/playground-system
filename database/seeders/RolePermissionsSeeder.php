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

        Role::firstOrCreate([
            'name' => RolesEnum::User->value,
            'label' => 'User',
        ]);

        $superAdminRole->syncPermissions([
            PermissionsEnum::ViewPlatformMetrics->value,
        ]);
        // user role has no default permissions
    }
}
