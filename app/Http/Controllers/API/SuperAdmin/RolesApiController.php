<?php

namespace App\Http\Controllers\API\SuperAdmin;

use App\DTOs\Roles\CreateRoleData;
use App\DTOs\Roles\UpdateRoleData;
use App\Http\Controllers\Controller;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use App\Services\RoleService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RolesApiController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private RoleService $roleService) {}

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'          => ['required', 'string', 'max:50', 'unique:roles,name', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'],
            'label'         => ['required', 'string', 'max:50'],
            'permissions'   => ['sometimes', 'array'],
            'permissions.*' => ['integer', 'exists:permissions,id'],
        ]);

        $role = $this->roleService->create(CreateRoleData::fromValidated($validated));

        return $this->successResponse(new RoleResource($role), 'Role created successfully', 201);
    }

    public function update(Request $request, Role $role): JsonResponse
    {
        $validated = $request->validate([
            'name'          => ['required', 'string', 'max:50', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('roles', 'name')->ignore($role->id)],
            'label'         => ['required', 'string', 'max:50'],
            'permissions'   => ['sometimes', 'array'],
            'permissions.*' => ['integer', 'exists:permissions,id'],
        ]);

        $role = $this->roleService->update($role, UpdateRoleData::fromValidated($validated));

        return $this->successResponse(new RoleResource($role), 'Role updated successfully');
    }

    public function destroy(Role $role): JsonResponse
    {
        $this->roleService->delete($role);

        return $this->successResponse([], 'Role deleted successfully');
    }
}
