<?php

use App\Http\Controllers\Settings\AppearanceController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:super_admin'])->group(function () {
    Route::group(['prefix' => 'super-admin/settings', 'as' => 'super-admin.settings.'], function () {
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

        Route::get('/password', [PasswordController::class, 'edit'])->name('password');
        Route::put('/password', [PasswordController::class, 'update'])->name('password.update');

        Route::get('/appearance', AppearanceController::class)->name('appearance');
    });
});
