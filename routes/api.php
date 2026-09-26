<?php

use App\Http\Controllers\API\SuperAdmin\RolesApiController;
use App\Http\Controllers\API\SuperAdmin\UsersApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| JSON mutation endpoints
|--------------------------------------------------------------------------
| Page renders live in routes/super-admin.php as Inertia GET routes.
| Everything that writes goes here and returns the { ok, message, data } /
| { ok, message, errors } envelope from ApiResponseTrait.
|
| Updates use POST rather than PUT so the same endpoint accepts multipart
| FormData — browsers cannot send PUT with a file body.
*/

Route::middleware('auth:sanctum')->get('/user', fn (Request $request) => $request->user())->name('api.user');

// Platform administration
Route::middleware(['auth:sanctum', 'throttle:60,1', 'role:super_admin'])->group(function () {
    Route::prefix('super-admin')->group(function () {
        Route::post('users', [UsersApiController::class, 'store']);
        Route::post('users/{user}', [UsersApiController::class, 'update']);
        Route::delete('users/{user}', [UsersApiController::class, 'destroy']);

        Route::post('roles', [RolesApiController::class, 'store']);
        Route::post('roles/{role}', [RolesApiController::class, 'update']);
        Route::delete('roles/{role}', [RolesApiController::class, 'destroy']);

        // Register your modules here, e.g.:
        // Route::post('projects', [ProjectApiController::class, 'store']);
        // Route::post('projects/{project}', [ProjectApiController::class, 'update']);
        // Route::delete('projects/{project}', [ProjectApiController::class, 'destroy']);
    });
});
