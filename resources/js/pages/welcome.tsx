import { Head, Link } from '@inertiajs/react';

import { LayoutGrid, Moon, ScrollText, ShieldCheck, Sun, UserCircleIcon } from 'lucide-react';

import { useAppearance } from '@/hooks/use-appearance';
import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from '@/lib/i18n';

import { BetaBanner } from '@/components/beta-banner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

import type { SharedData } from '@/types';

/**
 * Public landing page.
 *
 * This is placeholder copy — replace the FEATURES array and the hero with your
 * product's story.
 */

const FEATURES = [
    { icon: ShieldCheck, title: 'Roles and permissions', description: 'Spatie-backed roles and permissions, ready to extend beyond the default super admin role.' },
    { icon: LayoutGrid, title: 'A working admin panel', description: 'User and role management out of the box, with the controller / service / DTO / resource pattern already established. Add your domain and ship.' },
    { icon: ScrollText, title: 'Activity log', description: 'Every meaningful action is recorded and searchable from the admin panel.' },
];

function ThemeToggle() {
    const { appearance, updateAppearance } = useAppearance();
    const { t } = useTranslation();
    const isDark = appearance === 'dark';

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => updateAppearance(isDark ? 'light' : 'dark')}
            aria-label={isDark ? t('Switch to light mode') : t('Switch to dark mode')}
        >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
    );
}

export default function Welcome(props: SharedData) {
    const { t } = useTranslation();
    const { isSuperAdmin } = useAuth();

    return (
        <>
            <Head title={t('Welcome')} />
            <BetaBanner />

            <div className="bg-background text-foreground min-h-screen">
                <header className="border-b">
                    <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                        <span className="font-semibold">{props.name}</span>
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            {isSuperAdmin ? (
                                <Button asChild size="sm">
                                    <Link href={route('super-admin.index')}>
                                        <UserCircleIcon className="mr-1.5 h-4 w-4" />
                                        {t('Go to app')}
                                    </Link>
                                </Button>
                            ) : (
                                <Button asChild variant="ghost" size="sm">
                                    <Link href={route('login')}>{t('Log in')}</Link>
                                </Button>
                            )}
                        </div>
                    </nav>
                </header>

                <main className="mx-auto max-w-5xl px-6">
                    <section className="py-20 text-center sm:py-28">
                        <h1 className="mx-auto max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                            {t('A clean admin + public site starting point')}
                        </h1>
                        <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-lg text-pretty">
                            {t('Roles, an admin panel and an activity log, already wired up. Start from a working product and add what makes yours different.')}
                        </p>
                    </section>

                    <section className="grid gap-6 pb-20 sm:grid-cols-2 lg:grid-cols-3">
                        {FEATURES.map(({ icon: Icon, title, description }) => (
                            <Card key={title}>
                                <CardHeader className="pb-3">
                                    <Icon className="text-primary h-5 w-5" />
                                    <h2 className="mt-3 font-medium">{t(title)}</h2>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground text-sm text-pretty">{t(description)}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </section>
                </main>

                <footer className="border-t">
                    <div className="text-muted-foreground mx-auto max-w-5xl px-6 py-8 text-center text-sm">
                        &copy; {new Date().getFullYear()} {props.name}
                    </div>
                </footer>
            </div>
        </>
    );
}
