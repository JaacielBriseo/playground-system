import { Head } from '@inertiajs/react';

import { Shield, TrendingUp, Users } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { useTranslation } from '@/lib/i18n';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

import type { SharedData } from '@/types';

interface Metrics {
    users: number;
    roles: number;
    signups_this_month: number;
}

interface Props extends SharedData {
    metrics: Metrics;
}

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="text-muted-foreground text-sm font-medium">{label}</span>
                <Icon className="text-muted-foreground h-4 w-4" />
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
                    <h1 className="text-xl font-semibold">{t('Overview')}</h1>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Stat icon={Users} label={t('Users')} value={metrics.users} />
                    <Stat icon={Shield} label={t('Roles')} value={metrics.roles} />
                    <Stat icon={TrendingUp} label={t('New this month')} value={metrics.signups_this_month} />
                </section>
            </div>
        </AppLayout>
    );
}
