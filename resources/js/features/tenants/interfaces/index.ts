export type SubscriptionStatus =
    | 'active'
    | 'trialing'
    | 'past_due'
    | 'canceled'
    | 'incomplete'
    | 'incomplete_expired'
    | 'unpaid'
    | 'inactive';

export interface TenantResource {
    id: number;
    name: string;
    /** Platform-level lock set by a super admin, independent of Stripe. */
    status: 'active' | 'suspended';
    stripe_id: string | null;
    pm_last_four: string | null;
    trial_ends_at: string | null;
    subscription_status: SubscriptionStatus;
    users_count: number;
    created_at: string;
}

/**
 * Presentation for each Stripe subscription status.
 *
 * `label` is a translation key, not display text — render it through t() so it
 * picks up the active locale. See lang/{locale}.json.
 */
export const subscriptionStatusConfig: Record<SubscriptionStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    active: { label: 'Active', variant: 'default' },
    trialing: { label: 'Trial', variant: 'secondary' },
    past_due: { label: 'Past due', variant: 'destructive' },
    canceled: { label: 'Cancelled', variant: 'outline' },
    incomplete: { label: 'Incomplete', variant: 'destructive' },
    incomplete_expired: { label: 'Incomplete (expired)', variant: 'destructive' },
    unpaid: { label: 'Unpaid', variant: 'destructive' },
    inactive: { label: 'Inactive', variant: 'outline' },
};
