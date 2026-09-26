<?php

namespace App\Http\Controllers\API\SuperAdmin;

use App\DTOs\Users\CreateUserData;
use App\DTOs\Users\UpdateUserData;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\UserService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UsersApiController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private UserService $userService) {}

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'roles'    => ['sometimes', 'array'],
            'roles.*'  => ['string', 'exists:roles,name'],
        ]);

        $user = $this->userService->create(CreateUserData::fromValidated($validated));

        return $this->successResponse(new UserResource($user), 'User created successfully', 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name'     => ['sometimes', 'required', 'string', 'max:255'],
            'email'    => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => ['sometimes', 'nullable', 'confirmed', Password::defaults()],
            'roles'    => ['sometimes', 'array'],
            'roles.*'  => ['string', 'exists:roles,name'],
        ]);

        $user = $this->userService->update($user, UpdateUserData::fromValidated($validated));

        return $this->successResponse(new UserResource($user), 'User updated successfully');
    }

    public function destroy(User $user): JsonResponse
    {
        abort_if($user->id === Auth::id(), 403, 'You cannot delete your own account.');

        $this->userService->delete($user, Auth::id());

        return $this->successResponse([], 'User deleted successfully');
    }
}
