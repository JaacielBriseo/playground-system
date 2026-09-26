<?php

namespace App\Http\Controllers;

use App\Enums\RolesEnum;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class SubscriptionController extends Controller
{
    public function checkout(Request $request): Response|RedirectResponse
    {
        $tenant = $request->user()->load('tenant')->tenant;

        if ($tenant && $tenant->subscribed('default')) {
            return redirect()->route('admin.index');
        }

        return Inertia::render('subscription/checkout', [
            'trial_days' => config('cashier.trial_days'),
        ]);
    }

    public function start(Request $request): RedirectResponse|SymfonyResponse
    {
        $tenant = $request->user()->load('tenant')->tenant;

        if (! $tenant) {
            return redirect()->route('subscription.checkout')
                ->with('error', __('No account is linked to this user. Please contact support.'));
        }

        if ($tenant->subscribed('default')) {
            return redirect()->route('admin.index');
        }

        $checkout = $tenant->newSubscription('default', config('cashier.price_id'))
            ->trialDays(config('cashier.trial_days'))
            ->checkout([
                'success_url' => route('subscription.success'),
                'cancel_url'  => route('subscription.checkout'),
            ]);

        // Inertia needs a hard redirect to leave the SPA for Stripe's hosted page.
        // Read the URL off the Stripe session rather than Checkout's __get proxy.
        return Inertia::location($checkout->asStripeCheckoutSession()->url);
    }

    public function success(Request $request): RedirectResponse
    {
        $user = $request->user()->load('tenant');

        // Heal orphaned accounts that were created before roles were seeded
        if (! $user->hasRole(RolesEnum::AccountOwner->value)) {
            $user->assignRole(RolesEnum::AccountOwner->value);
        }

        $tenant = $user->tenant;

        if ($tenant && $tenant->subscribed('default')) {
            activity('saas')
                ->causedBy($user)
                ->performedOn($tenant)
                ->log('subscription.activated');

            return redirect()->route('admin.index');
        }

        // Webhook may not have fired yet — show a "processing" state on the inactive page
        return redirect()->route('subscription.inactive')->with('justPaid', true);
    }

    public function inactive(Request $request): Response
    {
        return Inertia::render('subscription/inactive', [
            'justPaid' => $request->session()->pull('justPaid', false),
        ]);
    }
}
