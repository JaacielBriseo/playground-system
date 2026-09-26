<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationPromptController extends Controller
{
    /**
     * Show the email verification prompt page.
     */
    public function __invoke(Request $request): Response|RedirectResponse
    {
        if (! $request->user()->hasVerifiedEmail()) {
            return Inertia::render('auth/verify-email', ['status' => $request->session()->get('status')]);
        }

        $tenant = $request->user()->tenant;

        return $tenant && $tenant->subscribed('default')
            ? redirect()->route('admin.index')
            : redirect()->route('subscription.checkout');
    }
}
