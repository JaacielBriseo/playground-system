import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import AuthLayout from '@/layouts/auth-layout';
import { useTranslation } from '@/lib/i18n';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
    teamName: string;
    email: string;
    token: string;
}

export default function AcceptInvitationPage({ teamName, email, token }: Props) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('invitation.accept', token));
    };

    return (
        <AuthLayout title={t('Join :team', { team: teamName })} description={t('Create your account to join the :team team.', { team: teamName })}>
            <Head title={t('Accept invitation')} />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">{t('Email address')}</Label>
                        {/* Fixed to the invited address — the invitation is bound to it. */}
                        <Input id="email" type="email" value={email} readOnly className="bg-muted" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">{t('Full name')}</Label>
                        <Input
                            id="name"
                            type="text"
                            autoFocus
                            required
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder={t('Your name')}
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">{t('Password')}</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder={t('Choose a password')}
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">{t('Confirm password')}</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder={t('Confirm password')}
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button type="submit" className="mt-2 w-full" disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {t('Create account and join')}
                    </Button>
                </div>
            </form>
        </AuthLayout>
    );
}
