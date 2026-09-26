import { Activity, LayoutGrid, Settings, Shield, Users } from 'lucide-react';

import { t } from '@/lib/i18n';

import type { NavSections } from '@/types';

// Functions instead of module-level constants so that route() is called lazily
// at component render time — avoids "Ziggy is not defined" crashes when this
// module is imported before Ziggy initializes (tests, SSR). The same laziness
// keeps t() reading the dictionary of the page currently being rendered.
export const getSuperAdminNavItems = (): NavSections => [
    {
        title: t('General'),
        items: [
            {
                title: t('Dashboard'),
                href: route('super-admin.index'),
                icon: LayoutGrid,
            },
            // Add your modules here.
        ],
    },
    {
        title: t('Administration'),
        items: [
            {
                title: t('Users'),
                href: route('super-admin.users.index'),
                icon: Users,
            },
            {
                title: t('Roles'),
                href: route('super-admin.roles.index'),
                icon: Shield,
            },
        ],
    },
    {
        title: t('System'),
        items: [
            {
                title: t('Activity log'),
                href: route('super-admin.activity-log.index'),
                icon: Activity,
            },
        ],
    },
    {
        title: t('Account'),
        items: [
            {
                title: t('Settings'),
                href: route('super-admin.settings.profile'),
                icon: Settings,
            },
        ],
    },
];
