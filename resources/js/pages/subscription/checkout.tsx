import { Head, Link, useForm } from '@inertiajs/react';
import { CheckCircle2, LoaderCircle } from 'lucide-react';
import type { FormEventHandler } from 'react';

import { useTranslation } from '@/lib/i18n';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

import type { SharedData } from '@/types';

/**
 * Last stop before Stripe Checkout. Posting the form creates the subscription
 * with a trial and redirects to Stripe's hosted page — see SubscriptionController.
 */

const PLAN_INCLUDES = ['Unlimited team members', 'Tenant data isolation', 'Self-service billing portal', 'Email support'];

export default function SubscriptionCheckout({ auth, trial_days }: SharedData & { trial_days: number }) {
    const { post, processing } = useForm({});
    const { t } = useTranslation();

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('subscription.start'));
    };

    return (
        <div className="bg-background flex min-h-screen items-center justify-center p-4">
            <Head title={t('Activate your subscription')} />

            <div className="w-full max-w-md space-y-6">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold tracking-tight">{t('Almost there')}</h1>
                    <p className="text-muted-foreground">{t('Hi :name, activate your free trial to get started.', { name: auth?.user?.name ?? '' })}</p>
                </div>

                <Card className="border-primary border-2 shadow-lg">
                    <CardHeader className="pb-4 text-center">
                        <div className="bg-primary text-primary-foreground mb-3 inline-block self-center rounded-full px-3 py-1 text-xs font-semibold">
                            {t(':days days free · No charge today', { days: trial_days })}
                        </div>
                        <p className="text-muted-foreground text-sm">{t('Your card is saved for when the trial ends. Cancel anytime.')}</p>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        <ul className="space-y-3">
                            {PLAN_INCLUDES.map((feature) => (
                                <li key={feature} className="flex items-center gap-3 text-sm">
                                    <CheckCircle2 className="text-primary h-4 w-4 shrink-0" />
                                    <span>{t(feature)}</span>
                                </li>
                            ))}
                        </ul>

                        <form onSubmit={submit}>
                            <Button type="submit" className="w-full" size="lg" disabled={processing}>
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                {processing ? t('Redirecting to payment…') : t('Start free trial')}
                            </Button>
                        </form>

                        <p className="text-muted-foreground text-center text-xs">
                            {t('A credit card is required. You will not be charged during the :days-day trial.', { days: trial_days })}
                        </p>
                    </CardContent>
                </Card>

                <p className="text-muted-foreground text-center text-sm">
                    {t('Not you?')}{' '}
                    <Link href={route('logout')} method="post" as="button" className="underline hover:no-underline">
                        {t('Log out')}
                    </Link>
                </p>
            </div>
        </div>
    );
}
