<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\UnauthorizedController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');
Route::get('/unauthorized', UnauthorizedController::class)->name('unauthorized');

require __DIR__ . '/auth.php';
require __DIR__ . '/settings.php';
require __DIR__ . '/super-admin.php';
