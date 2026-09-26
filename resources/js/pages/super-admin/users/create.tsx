import { Head } from '@inertiajs/react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import AppLayout from '@/layouts/app-layout';

import { UserForm } from '@/features/users/components/user-form';
import type { Role } from '@/features/users/interfaces';

import type { SharedData } from '@/types';
import { useTranslation } from '@/lib/i18n';

interface Props extends Partial<SharedData> {
    roles: Role[];
}

const CreateUserPage = (props: Props) => {
    const { t } = useTranslation();
    return (
        <AppLayout
            {...props}
            breadcrumbs={[
                { title: 'Dashboard', href: route('super-admin.index') },
                { title: 'Usuarios', href: route('super-admin.users.index') },
                { title: 'Crear', href: route('super-admin.users.create') },
            ]}
        >
            <Head title={t('Create user')} />

            <div className="flex flex-1 flex-col gap-5 p-4">
                <section>
                    <h1 className="text-2xl font-bold">{t('Create user')}</h1>
                    <span className="text-muted-foreground text-sm">{t('Fill in the form to create a new user')}</span>
                </section>

                <section>
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('User information')}</CardTitle>
                            <CardDescription>{t('Enter the details for the new user')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <UserForm roles={props.roles} />
                        </CardContent>
                    </Card>
                </section>
            </div>
        </AppLayout>
    );
};

export default CreateUserPage;

