import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

// Lazy so route() and t() resolve at render time, not module load.
const getSidebarNavItems = (t: (key: string) => string): NavItem[] => [
    {
        title: t('Profile'),
        href: route('admin.settings.profile'),
        icon: null,
    },
    {
        title: t('Password'),
        href: route('admin.settings.password'),
        icon: null,
    },
    {
        title: t('Appearance'),
        href: route('admin.settings.appearance'),
        icon: null,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { t } = useTranslation();

    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;
    const sidebarNavItems = getSidebarNavItems(t);

    // route() yields an absolute URL; compare only the path part against location.
    const isActive = (href: string) => new URL(href, window.location.origin).pathname === currentPath;

    return (
        <div className="px-4 py-6">
            <Heading title={t('Settings')} description={t('Manage your profile and account settings')} />

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {sidebarNavItems.map((item, index) => (
                            <Button
                                key={`${item.href}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': isActive(item.href),
                                })}
                            >
                                <Link href={item.href} prefetch>
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 md:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">{children}</section>
                </div>
            </div>
        </div>
    );
}
