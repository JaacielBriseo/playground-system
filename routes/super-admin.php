<?php

use App\Http\Controllers\SuperAdmin\ActivityLogController;
use App\Http\Controllers\SuperAdmin\DashboardController;
use App\Http\Controllers\SuperAdmin\RolesController;
use App\Http\Controllers\SuperAdmin\UsersController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:super_admin'])->group(function () {
    Route::group(['prefix' => 'super-admin', 'as' => 'super-admin.'], function () {
        Route::get('/', DashboardController::class)->name('index');

        Route::resource('users', UsersController::class)
            ->only(['index', 'create', 'edit', 'show']);

        Route::resource('roles', RolesController::class)
            ->only(['index', 'create', 'edit']);

        Route::get('activity-log', ActivityLogController::class)->name('activity-log.index');

        // Register your modules here, e.g.:
        // Route::resource('projects', ProjectController::class)->only(['index', 'create', 'edit']);
    });
});
