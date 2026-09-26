import { Head, Link } from '@inertiajs/react';

import { BarChart3, CheckCircle2, Moon, ShieldCheck, Sun, UserCircleIcon, Users, Zap } from 'lucide-react';

import { useAppearance } from '@/hooks/use-appearance';
import { useTranslation } from '@/lib/i18n';

import { BetaBanner } from '@/components/beta-banner';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

import type { SharedData } from '@/types';

/**
 * Public landing page.
 *
 * This is placeholder marketing copy — replace the FEATURES / PLAN_INCLUDES /
 * FAQ arrays and the hero with your product's story. What is worth keeping is
 * the pricing card: it renders the real recurring price pulled from Stripe by
 * HomeController, and degrades to a "contact us" state when STRIPE_PRICE_ID is
 * unset, so the page works before billing is configured.
 */

interface Plan {
    amount: number;
    currency: string;
    interval: string;
    interval_count: number;
    product_name: string | null;
}

interface Props extends SharedData {
    plan: Plan | null;
}

const FEATURES = [
    { icon: Users, title: 'Multi-tenant by default', description: 'Every record is scoped to a tenant by a global query scope. Isolation is the default, not a code review checklist.' },
    { icon: Zap, title: 'Billing that gates access', description: 'Stripe Checkout, the customer portal and webhooks are wired up. No subscription means no access — enforced in middleware.' },
    { icon: ShieldCheck, title: 'Roles and a support console', description: 'Super admin, account owner and team member roles, plus tenant impersonation with a time limit and an audit trail.' },
    { icon: BarChart3, title: 'Ready to build on', description: 'Typed end to end, with the controller / service / DTO / resource pattern already established. Add your domain and ship.' },
];

const PLAN_INCLUDES = [
    'Unlimited team members',
    'Tenant data isolation',
    'Self-service billing portal',
    'Email support',
];

const FAQ = [
    { q: 'When is my card charged?', a: 'When the free trial ends. Cancel before then and you are never charged.' },
    { q: 'Can I invite my team?', a: 'Yes. Invite as many members as you need — each gets their own login, scoped to your account.' },
    { q: 'Can I cancel anytime?', a: 'Yes, from your account settings. No calls, no paperwork, no penalties.' },
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

function PriceTag({ plan, locale }: { plan: Plan; locale: string }) {
    const { t } = useTranslation();

    const amount = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: plan.currency,
        minimumFractionDigits: plan.amount % 1 === 0 ? 0 : 2,
    }).format(plan.amount);

    const interval =
        plan.interval_count === 1
            ? { month: t('/ month'), year: t('/ year') }[plan.interval] ?? `/ ${plan.interval}`
            : t('/ :count :interval', { count: plan.interval_count, interval: plan.interval });

    return (
        <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-semibold tracking-tight">{amount}</span>
            <span className="text-muted-foreground text-sm">{interval}</span>
        </div>
    );
}

export default function Welcome({ plan, ...props }: Props) {
    const { t, locale } = useTranslation();
    const user = props.auth?.user;

    return (
        <>
            <Head title={t('Start your account')} />
            <BetaBanner />

            <div className="bg-background text-foreground min-h-screen">
                <header className="border-b">
                    <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                        <span className="font-semibold">{props.name}</span>
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            {user ? (
                                <Button asChild size="sm">
                                    <Link href={route('admin.index')}>
                                        <UserCircleIcon className="mr-1.5 h-4 w-4" />
                                        {t('Go to app')}
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href={route('login')}>{t('Log in')}</Link>
                                    </Button>
                                    <Button asChild size="sm">
                                        <Link href={route('register')}>{t('Get started')}</Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </nav>
                </header>

                <main className="mx-auto max-w-5xl px-6">
                    <section className="py-20 text-center sm:py-28">
                        <h1 className="mx-auto max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                            {t('The boring parts of your SaaS, already built')}
                        </h1>
                        <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-lg text-pretty">
                            {t('Tenants, roles, subscriptions and a support console. Start from a working product and add what makes yours different.')}
                        </p>
                        <div className="mt-8 flex justify-center gap-3">
                            <Button asChild size="lg">
                                <Link href={route('register')}>{t('Get started')}</Link>
                            </Button>
                        </div>
                    </section>

                    <section className="grid gap-6 pb-20 sm:grid-cols-2">
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

                    <section id="pricing" className="pb-20">
                        <h2 className="text-center text-2xl font-semibold tracking-tight">{t('Pricing')}</h2>

                        <Card className="mx-auto mt-8 max-w-sm">
                            <CardHeader className="text-center">
                                {plan ? (
                                    <>
                                        <p className="text-muted-foreground text-sm font-medium">{plan.product_name ?? props.name}</p>
                                        <div className="mt-3">
                                            <PriceTag plan={plan} locale={locale} />
                                        </div>
                                    </>
                                ) : (
                                    // STRIPE_PRICE_ID not configured yet — the page still renders.
                                    <p className="text-muted-foreground text-sm">{t('Pricing is not configured yet.')}</p>
                                )}
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {PLAN_INCLUDES.map((item) => (
                                        <li key={item} className="flex items-start gap-2 text-sm">
                                            <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                                            <span>{t(item)}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button asChild className="mt-6 w-full">
                                    <Link href={route('register')}>{t('Start free trial')}</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </section>

                    <section className="pb-20">
                        <h2 className="text-center text-2xl font-semibold tracking-tight">{t('Frequently asked questions')}</h2>
                        <Accordion type="single" collapsible className="mx-auto mt-8 max-w-2xl">
                            {FAQ.map(({ q, a }) => (
                                <AccordionItem key={q} value={q}>
                                    <AccordionTrigger className="text-left">{t(q)}</AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground text-pretty">{t(a)}</AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
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
