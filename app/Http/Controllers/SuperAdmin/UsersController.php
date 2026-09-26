<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UsersController extends Controller
{
    public function index(Request $request): Response
    {
        $users = User::query()
            ->search($request->string('search')->toString(), ['name', 'email'])
            ->with(['permissions', 'roles'])
            ->paginate($request->integer('per_page', 15));

        return Inertia::render('super-admin/users/index', [
            'users'   => UserResource::collection($users),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('super-admin/users/create', [
            'roles' => Role::select(['id', 'name', 'label'])->get(),
        ]);
    }

    public function edit(User $user): Response
    {
        $user->load(['permissions', 'roles']);

        return Inertia::render('super-admin/users/edit', [
            'user'  => new UserResource($user),
            'roles' => Role::select(['id', 'name', 'label'])->get(),
        ]);
    }

    public function show(User $user): Response
    {
        $user->load(['permissions', 'roles']);

        return Inertia::render('super-admin/users/show', [
            'user' => new UserResource($user),
        ]);
    }
}
