<?php

namespace App\Listeners;

use App\Models\Tenant;
use Illuminate\Contracts\Queue\ShouldQueue;
use Laravel\Cashier\Events\WebhookHandled;

class LogCashierWebhookActivity implements ShouldQueue
{
    private const TRACKED_EVENTS = [
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.payment_failed',
        'invoice.payment_succeeded',
        'customer.subscription.trial_will_end',
    ];

    public function handle(WebhookHandled $event): void
    {
        $payload = $event->payload;
        $eventType = $payload['type'] ?? 'unknown';

        if (! in_array($eventType, self::TRACKED_EVENTS)) {
            return;
        }

        $object = $payload['data']['object'] ?? [];
        $stripeCustomerId = $object['customer'] ?? null;
        $tenant = $stripeCustomerId
            ? Tenant::where('stripe_id', $stripeCustomerId)->first()
            : null;

        // For invoice.* events, the subscription ID is at $object['subscription'];
        // $object['id'] is the invoice ID (in_xxx). For subscription.* events,
        // $object['id'] is the subscription ID (sub_xxx) directly.
        $subscriptionId = str_starts_with($eventType, 'invoice.')
            ? ($object['subscription'] ?? null)
            : ($object['id'] ?? null);

        $logger = activity('stripe')
            ->withProperties([
                'event_type'             => $eventType,
                'stripe_customer_id'     => $stripeCustomerId,
                'stripe_subscription_id' => $subscriptionId,
                'status'                 => $object['status'] ?? null,
            ]);

        if ($tenant) {
            $logger = $logger->performedOn($tenant);
        }

        $logger->log($eventType);
    }
}
