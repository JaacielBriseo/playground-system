import { Head } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';
import { useTranslation } from '@/lib/i18n';

import type { SharedData } from '@/types';

export default function AdminDashboardPage(props: SharedData) {
    const { t } = useTranslation();

    return (
        <AppLayout {...props} breadcrumbs={[{ title: t('Dashboard'), href: route('admin.index') }]}>
            <Head title={t('Dashboard')} />

            <div className="flex flex-1 flex-col gap-5 p-4">
                <section>
                    <h1 className="text-xl font-semibold">{t('Dashboard')}</h1>
                    <p className="text-muted-foreground mt-1 text-sm">{t('Welcome back, :name.', { name: props.auth.user?.name ?? '' })}</p>
                </section>

                <section className="border-sidebar-border/70 flex min-h-[40vh] items-center justify-center rounded-xl border border-dashed">
                    <div className="max-w-md px-6 py-10 text-center">
                        <h2 className="text-base font-medium">{t('Your application starts here')}</h2>
                        <p className="text-muted-foreground mt-2 text-sm">
                            {t('Build your first module, then render its metrics on this page. See docs/ARCHITECTURE.md for the pattern.')}
                        </p>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
