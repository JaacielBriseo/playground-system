import { Head } from '@inertiajs/react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import AppLayout from '@/layouts/app-layout';

import { UserForm } from '@/features/users/components/user-form';
import type { Role, UserResource } from '@/features/users/interfaces';

import type { SharedData } from '@/types';
import { useTranslation } from '@/lib/i18n';

interface Props extends Partial<SharedData> {
    user: UserResource;
    roles: Role[];
}

const EditUserPage = (props: Props) => {
    const { t } = useTranslation();
    const { user, roles } = props;

    return (
        <AppLayout
            {...props}
            breadcrumbs={[
                { title: 'Dashboard', href: route('super-admin.index') },
                { title: 'Usuarios', href: route('super-admin.users.index') },
                { title: user.name, href: route('super-admin.users.show', user.id) },
                { title: 'Editar', href: route('super-admin.users.edit', user.id) },
            ]}
        >
            <Head title={`Editar Usuario: ${user.name}`} />

            <div className="flex flex-1 flex-col gap-5 p-4">
                <section>
                    <h1 className="text-2xl font-bold">Editar Usuario: {user.name}</h1>
                    <span className="text-muted-foreground text-sm">{t('Update this user information')}</span>
                </section>

                <section>
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('User information')}</CardTitle>
                            <CardDescription>{t('Update the user details')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <UserForm
                                roles={roles}
                                defaultValues={{
                                    id: user.id,
                                    name: user.name,
                                    email: user.email,
                                    roles: user.roles || [],
                                    password: '',
                                    password_confirmation: '',
                                }}
                            />
                        </CardContent>
                    </Card>
                </section>
            </div>
        </AppLayout>
    );
};

export default EditUserPage;

