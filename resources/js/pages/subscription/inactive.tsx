import { Head, Link, router } from '@inertiajs/react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { useTranslation } from '@/lib/i18n';

import { Button } from '@/components/ui/button';

import type { SharedData } from '@/types';

interface Props extends SharedData {
    justPaid?: boolean;
}

export default function SubscriptionInactive({ auth, justPaid }: Props) {
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const { t } = useTranslation();

    // If the user just came back from Stripe, the webhook may still be in
    // flight. Poll the success route until it passes the subscription check.
    useEffect(() => {
        if (!justPaid) return;

        pollRef.current = setInterval(() => {
            router.visit(route('subscription.success'), { preserveState: false });
        }, 3000);

        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [justPaid]);

    return (
        <div className="bg-background flex min-h-screen items-center justify-center p-4">
            <Head title={justPaid ? t('Activating your account') : t('Subscription inactive')} />

            <div className="w-full max-w-md space-y-6 text-center">
                <div className="flex justify-center">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-full ${justPaid ? 'bg-primary/10' : 'bg-destructive/10'}`}>
                        {justPaid ? <RefreshCw className="text-primary h-8 w-8 animate-spin" /> : <AlertCircle className="text-destructive h-8 w-8" />}
                    </div>
                </div>

                <div className="space-y-2">
                    {justPaid ? (
                        <>
                            <h1 className="text-2xl font-bold tracking-tight">{t('Activating your account…')}</h1>
                            <p className="text-muted-foreground">
                                {t('We received your payment and are activating your subscription. This takes a few seconds.')}
                            </p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold tracking-tight">{t('Subscription inactive')}</h1>
                            <p className="text-muted-foreground">{t('Your subscription expired or was cancelled. Reactivate your account to regain access.')}</p>
                        </>
                    )}
                </div>

                {justPaid ? (
                    <Button variant="outline" size="lg" onClick={() => router.visit(route('subscription.success'))}>
                        {t('Check now')}
                    </Button>
                ) : (
                    <div className="flex flex-col gap-3">
                        <Button asChild size="lg">
                            <Link href={route('admin.billing-portal')}>{t('Reactivate subscription')}</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                            <Link href={route('home')}>{t('Back to home')}</Link>
                        </Button>
                    </div>
                )}

                {auth?.user && (
                    <p className="text-muted-foreground text-sm">
                        {t('Signed in as')} <span className="font-medium">{auth.user.email}</span>
                        {' · '}
                        <Link href={route('logout')} method="post" as="button" className="underline hover:no-underline">
                            {t('Log out')}
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
}
