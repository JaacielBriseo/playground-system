<?php

use App\Http\Controllers\API\Admin\TeamApiController;
use App\Http\Controllers\API\SuperAdmin\RolesApiController;
use App\Http\Controllers\API\SuperAdmin\UsersApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| JSON mutation endpoints
|--------------------------------------------------------------------------
| Page renders live in routes/admin.php and routes/super-admin.php as Inertia
| GET routes. Everything that writes goes here and returns the
| { ok, message, data } / { ok, message, errors } envelope from ApiResponseTrait.
|
| Updates use POST rather than PUT so the same endpoint accepts multipart
| FormData — browsers cannot send PUT with a file body.
*/

Route::middleware('auth:sanctum')->get('/user', fn (Request $request) => $request->user())->name('api.user');

// Team management — account_owner only
Route::middleware(['auth:sanctum', 'throttle:60,1', 'role:account_owner', 'subscription.active'])->group(function () {
    Route::prefix('admin')->group(function () {
        Route::post('team/invite', [TeamApiController::class, 'invite']);
        Route::delete('team/members/{user}', [TeamApiController::class, 'removeMember']);
        Route::delete('team/invitations/{invitation}', [TeamApiController::class, 'cancelInvitation']);
        Route::post('team/invitations/{invitation}/resend', [TeamApiController::class, 'resendInvitation']);
    });
});

// Tenant modules — account_owner and team_member. Add your own endpoints here.
Route::middleware(['auth:sanctum', 'throttle:120,1', 'role:account_owner|team_member', 'subscription.active'])->group(function () {
    Route::prefix('admin')->group(function () {
        // Route::post('projects', [ProjectApiController::class, 'store']);
        // Route::post('projects/{project}', [ProjectApiController::class, 'update']);
        // Route::delete('projects/{project}', [ProjectApiController::class, 'destroy']);
    });
});

// Platform administration
Route::middleware(['auth:sanctum', 'throttle:60,1', 'role:super_admin'])->group(function () {
    Route::prefix('super-admin')->group(function () {
        Route::post('users', [UsersApiController::class, 'store']);
        Route::post('users/{user}', [UsersApiController::class, 'update']);
        Route::delete('users/{user}', [UsersApiController::class, 'destroy']);

        Route::post('roles', [RolesApiController::class, 'store']);
        Route::post('roles/{role}', [RolesApiController::class, 'update']);
        Route::delete('roles/{role}', [RolesApiController::class, 'destroy']);
    });
});
