<?php

use App\Http\Controllers\SuperAdmin\ActivityLogController;
use App\Http\Controllers\SuperAdmin\DashboardController;
use App\Http\Controllers\SuperAdmin\ImpersonationController;
use App\Http\Controllers\SuperAdmin\RolesController;
use App\Http\Controllers\SuperAdmin\TenantsController;
use App\Http\Controllers\SuperAdmin\UsersController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:super_admin'])->group(function () {
    Route::group(['prefix' => 'super-admin', 'as' => 'super-admin.'], function () {
        Route::get('/', DashboardController::class)->name('index');

        Route::resource('users', UsersController::class)
            ->only(['index', 'create', 'edit', 'show']);

        Route::resource('roles', RolesController::class)
            ->only(['index', 'create', 'edit']);

        Route::get('tenants', [TenantsController::class, 'index'])->name('tenants.index');
        Route::post('tenants/{tenant}/suspend', [TenantsController::class, 'suspend'])->name('tenants.suspend');
        Route::post('tenants/{tenant}/reactivate', [TenantsController::class, 'reactivate'])->name('tenants.reactivate');

        Route::post('tenants/{tenant}/impersonate', [ImpersonationController::class, 'impersonate'])->name('tenants.impersonate');
        Route::post('impersonation/stop', [ImpersonationController::class, 'stop'])->name('impersonation.stop');

        Route::get('activity-log', ActivityLogController::class)->name('activity-log.index');
    });
});
