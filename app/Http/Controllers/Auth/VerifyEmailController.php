<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect($this->redirectAfterVerification($request));
        }

        if ($request->user()->markEmailAsVerified()) {
            event(new Verified($request->user()));
        }

        return redirect($this->redirectAfterVerification($request));
    }

    private function redirectAfterVerification(EmailVerificationRequest $request): string
    {
        $tenant = $request->user()->tenant;

        if ($tenant && $tenant->subscribed('default')) {
            return route('admin.index') . '?verified=1';
        }

        return route('subscription.checkout') . '?verified=1';
    }
}
