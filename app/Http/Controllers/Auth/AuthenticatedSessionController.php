<?php

namespace App\Http\Controllers\Auth;

use App\Enums\RolesEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): SymfonyResponse
    {
        $request->authenticate();

        $request->session()->regenerate();
        $user = Auth::user();

        activity('auth')
            ->causedBy($user)
            ->withProperties(['ip' => $request->ip()])
            ->log('user.login');

        $callbackUrl = $request->get('callbackUrl');

        // Only allow relative paths to prevent open-redirect attacks
        if ($callbackUrl && str_starts_with($callbackUrl, '/') && ! str_starts_with($callbackUrl, '//')) {
            return Inertia::location(redirect()->intended($callbackUrl)->getTargetUrl());
        }

        $redirectTo = $user->hasRole(RolesEnum::SuperAdmin)
            ? route('super-admin.index', absolute: false)
            : route('home', absolute: false);

        return Inertia::location(redirect()->intended($redirectTo)->getTargetUrl());
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): SymfonyResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Inertia::location('/');
    }
}
