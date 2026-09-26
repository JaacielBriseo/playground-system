<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;

class RolesController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('super-admin/roles/index', [
            'roles' => Role::select(['id', 'name', 'label'])
                ->with(['permissions:id,name'])
                ->withCount('users')
                ->get(),
            'permissions' => Permission::select(['id', 'name'])
                ->with(['roles:id,name,label'])
                ->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('super-admin/roles/create');
    }

    public function edit(Role $role): Response
    {
        return Inertia::render('super-admin/roles/edit', [
            'role' => new RoleResource($role->load('permissions:id,name')),
        ]);
    }
}
