<?php

namespace App\Http\Resources;

use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Laravel\Cashier\Subscription;

/**
 * @mixin Tenant
 */
class TenantResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Ensure subscriptions are loaded — call sites should eager-load with
        // ->with('subscriptions'), but this guards against accidental lazy-load
        // exceptions when shouldBeStrict() is active.
        $subscriptions = $this->relationLoaded('subscriptions')
            ? $this->subscriptions
            : $this->loadMissing('subscriptions')->subscriptions;

        /** @var Subscription|null $subscription */
        $subscription = $subscriptions
            ->sortByDesc('created_at')
            ->first(fn (Subscription $s): bool => $s->type === 'default');

        // Pass through only the statuses the UI knows how to render; anything
        // else (including no subscription at all) reads as inactive.
        $known = ['active', 'trialing', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid'];

        $subscriptionStatus = in_array($subscription?->stripe_status, $known, true)
            ? $subscription->stripe_status
            : 'inactive';

        return [
            'id'                  => $this->id,
            'name'                => $this->name,
            // Platform-level lock, independent of the Stripe status below.
            'status'              => $this->status,
            'stripe_id'           => $this->stripe_id,
            'pm_last_four'        => $this->pm_last_four,
            'trial_ends_at'       => $this->trial_ends_at,
            'subscription_status' => $subscriptionStatus,
            'users_count'         => $this->users_count ?? 0,
            'created_at'          => $this->created_at,
        ];
    }
}
