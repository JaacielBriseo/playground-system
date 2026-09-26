<?php

namespace App\Services;

use App\DTOs\Roles\CreateRoleData;
use App\DTOs\Roles\UpdateRoleData;
use App\Exceptions\KnownException;
use App\Models\Role;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RoleService
{
    public function create(CreateRoleData $data): Role
    {
        try {
            DB::beginTransaction();

            $role = Role::create(['name' => $data->name, 'label' => $data->label]);

            if ($data->permissions !== null) {
                $role->syncPermissions($data->permissions);
            }

            DB::commit();

            return $role;
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error($e);
            throw $e;
        }
    }

    public function update(Role $role, UpdateRoleData $data): Role
    {
        try {
            DB::beginTransaction();

            $role->update(['name' => $data->name, 'label' => $data->label]);

            if ($data->permissions !== null) {
                $role->syncPermissions($data->permissions);
            }

            DB::commit();

            return $role;
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error($e);
            throw $e;
        }
    }

    public function delete(Role $role): void
    {
        if ($role->users()->exists()) {
            throw new KnownException('Cannot delete this role because it has users.', 422);
        }

        $role->delete();
    }
}
