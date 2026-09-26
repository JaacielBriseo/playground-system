import { Head, Link } from '@inertiajs/react';

import { AlertTriangle, Ban, Building2, Clock, CreditCard, TrendingUp, Users } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { useTranslation } from '@/lib/i18n';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

import type { SharedData } from '@/types';

interface Metrics {
    tenants: number;
    active_subscriptions: number;
    trialing: number;
    past_due: number;
    suspended: number;
    signups_this_month: number;
    users: number;
}

interface Props extends SharedData {
    metrics: Metrics;
}

function Stat({ icon: Icon, label, value, tone = 'default' }: { icon: typeof Users; label: string; value: number; tone?: 'default' | 'warning' }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="text-muted-foreground text-sm font-medium">{label}</span>
                <Icon className={tone === 'warning' && value > 0 ? 'h-4 w-4 text-amber-600' : 'text-muted-foreground h-4 w-4'} />
            </CardHeader>
            <CardContent>
                <span className="text-2xl font-semibold tabular-nums">{value}</span>
            </CardContent>
        </Card>
    );
}

export default function SuperAdminDashboard({ metrics, ...props }: Props) {
    const { t } = useTranslation();

    return (
        <AppLayout {...props} breadcrumbs={[{ title: t('Dashboard'), href: route('super-admin.index') }]}>
            <Head title={t('Dashboard')} />

            <div className="flex flex-1 flex-col gap-5 p-4">
                <section>
                    <h1 className="text-xl font-semibold">{t('Platform overview')}</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        {t('Across all tenants.')}{' '}
                        <Link href={route('super-admin.tenants.index')} className="underline underline-offset-4">
                            {t('Manage tenants')}
                        </Link>
                    </p>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Stat icon={Building2} label={t('Tenants')} value={metrics.tenants} />
                    <Stat icon={CreditCard} label={t('Active subscriptions')} value={metrics.active_subscriptions} />
                    <Stat icon={Clock} label={t('In trial')} value={metrics.trialing} />
                    <Stat icon={AlertTriangle} label={t('Past due')} value={metrics.past_due} tone="warning" />
                    <Stat icon={Ban} label={t('Suspended')} value={metrics.suspended} tone="warning" />
                    <Stat icon={TrendingUp} label={t('New this month')} value={metrics.signups_this_month} />
                    <Stat icon={Users} label={t('Users')} value={metrics.users} />
                </section>
            </div>
        </AppLayout>
    );
}
