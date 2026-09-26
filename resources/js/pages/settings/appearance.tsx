import { Head, router, usePage } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { SharedData, type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('admin.index') },
    { title: 'Appearance settings', href: route('admin.settings.appearance') },
];

export default function Appearance() {
    const page = usePage<SharedData>();

    const user = page.props.auth.user;

    if (!user) {
        router.visit('/auth/login');
        return;
    }
    return (
        <AppLayout breadcrumbs={breadcrumbs} user={user}>
            <Head title="Appearance settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Appearance settings" description="Update your account's appearance settings" />
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
