<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\UnauthorizedController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');
Route::get('/unauthorized', UnauthorizedController::class)->name('unauthorized');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/subscription/checkout', [SubscriptionController::class, 'checkout'])
        ->name('subscription.checkout');
    Route::post('/subscription/start', [SubscriptionController::class, 'start'])
        ->name('subscription.start');
    Route::get('/subscription/success', [SubscriptionController::class, 'success'])
        ->name('subscription.success');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/subscription/inactive', [SubscriptionController::class, 'inactive'])
        ->name('subscription.inactive');
});

Route::middleware(['guest', 'throttle:6,1'])->group(function () {
    Route::get('/invitation/{token}', [InvitationController::class, 'show'])->name('invitation.show');
    Route::post('/invitation/{token}', [InvitationController::class, 'accept'])->name('invitation.accept');
});

// Cashier auto-registers POST /stripe/webhook via CashierServiceProvider
// stripe command: stripe listen --forward-to http://localhost:8000/stripe/webhook

require __DIR__ . '/auth.php';
require __DIR__ . '/settings.php';
require __DIR__ . '/admin.php';
require __DIR__ . '/super-admin.php';
