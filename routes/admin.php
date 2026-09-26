<?php

use App\Http\Controllers\Admin\BillingPortalController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\SubscriptionStatusController;
use App\Http\Controllers\Admin\TeamController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Tenant (Account Owner) — Inertia page routes, GET only
|--------------------------------------------------------------------------
| Mutations belong in routes/api.php as JSON endpoints. Named routes follow
| the `admin.{resource}.{action}` convention.
|
| Note the deliberate split below: billing routes must stay OUTSIDE the
| `subscription.active` gate, otherwise a tenant whose subscription lapsed
| could never reach the page that lets them pay.
*/

// Billing — account_owner only, and NOT behind the subscription gate.
Route::middleware(['auth', 'verified', 'role:account_owner'])->group(function () {
    Route::group(['prefix' => 'admin', 'as' => 'admin.'], function () {
        Route::get('/billing-portal', BillingPortalController::class)->name('billing-portal');
        Route::get('/subscription', SubscriptionStatusController::class)->name('subscription.status');
    });
});

// The tenant application. Everything here requires an active subscription.
Route::middleware(['auth', 'verified', 'role:account_owner|team_member', 'subscription.active'])->group(function () {
    Route::group(['prefix' => 'admin', 'as' => 'admin.'], function () {
        Route::get('/', DashboardController::class)->name('index');

        // Register your tenant modules here, e.g.:
        // Route::resource('projects', ProjectController::class)->only(['index', 'create', 'edit']);
    });
});

// Team management — account owner only.
Route::middleware(['auth', 'verified', 'role:account_owner', 'subscription.active'])->group(function () {
    Route::group(['prefix' => 'admin', 'as' => 'admin.'], function () {
        Route::get('/team', [TeamController::class, 'index'])->name('team.index');
    });
});
