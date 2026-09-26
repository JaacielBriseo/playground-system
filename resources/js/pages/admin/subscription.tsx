import { Head, Link } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';
import { formatDateTime } from '@/lib/formatters/dates';
import { useTranslation } from '@/lib/i18n';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { subscriptionStatusConfig, type TenantResource } from '@/features/tenants/interfaces';

import type { SharedData } from '@/types';

interface Props extends Partial<SharedData> {
    tenant: TenantResource;
}

// Keyed by the Stripe status normalised in TenantResource.
const statusDescriptions: Record<TenantResource['subscription_status'], string> = {
    active: 'Your subscription is active.',
    trialing: 'You are in your free trial period.',
    past_due: 'There is a problem with your payment method.',
    canceled: 'Your subscription was cancelled.',
    incomplete: 'The payment process was not completed.',
    incomplete_expired: 'The payment attempt expired.',
    unpaid: 'Your subscription has not been paid.',
    inactive: 'You do not have an active subscription.',
};

export default function AdminSubscriptionPage({ tenant, ...props }: Props) {
    const { t } = useTranslation();
    const status = subscriptionStatusConfig[tenant.subscription_status];
    const description = statusDescriptions[tenant.subscription_status];

    return (
        <AppLayout
            {...props}
            breadcrumbs={[
                { title: t('Dashboard'), href: route('admin.index') },
                { title: t('Subscription'), href: route('admin.subscription.status') },
            ]}
        >
            <Head title={t('Subscription')} />
            <div className="flex flex-1 flex-col gap-5 p-4">
                <section>
                    <h1 className="text-2xl leading-none font-bold">{t('Subscription')}</h1>
                    <p className="text-muted-foreground mt-1 text-sm">{t('Manage your subscription and payment method.')}</p>
                </section>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('Subscription status')}</CardTitle>
                            <CardDescription>{tenant.name}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Badge variant={status.variant}>{t(status.label)}</Badge>
                                <span className="text-muted-foreground text-sm">{t(description)}</span>
                            </div>

                            {tenant.trial_ends_at && tenant.subscription_status === 'trialing' && (
                                <p className="text-muted-foreground text-sm">
                                    {t('Your free trial ends on :date', {
                                        date: formatDateTime(tenant.trial_ends_at, { year: 'numeric', month: 'long', day: 'numeric' }),
                                    })}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('Payment method')}</CardTitle>
                            <CardDescription>{t('Your card on file with Stripe.')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {tenant.pm_last_four ? (
                                <p className="text-sm">
                                    {t('Card ending in')} <span className="font-mono font-semibold">{tenant.pm_last_four}</span>
                                </p>
                            ) : (
                                <p className="text-muted-foreground text-sm">{t('No payment method on file.')}</p>
                            )}

                            {/* Redirects to Stripe's hosted portal — card updates,
                                cancellation and reactivation all happen there. */}
                            <Button asChild variant="outline">
                                <Link href={route('admin.billing-portal')}>{t('Manage in Stripe')}</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
