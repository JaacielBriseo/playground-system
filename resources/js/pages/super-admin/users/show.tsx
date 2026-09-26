import { Head, Link } from '@inertiajs/react';
import { CalendarIcon, MailIcon, PencilIcon, ShieldIcon, UserIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import AppLayout from '@/layouts/app-layout';

import { formatDateTime } from '@/lib/formatters/dates';
import type { UserResource } from '@/features/users/interfaces';

import type { SharedData } from '@/types';
import { useTranslation } from '@/lib/i18n';

interface Props extends Partial<SharedData> {
    user: UserResource;
}

const ShowUserPage = (props: Props) => {
    const { t } = useTranslation();
    const { user } = props;

    const formatDate = (date: string | Date | null) =>
        date
            ? formatDateTime(date, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            : 'N/A';

    return (
        <AppLayout
            {...props}
            breadcrumbs={[
                { title: 'Dashboard', href: route('super-admin.index') },
                { title: 'Usuarios', href: route('super-admin.users.index') },
                { title: user.name, href: route('super-admin.users.show', user.id) },
            ]}
        >
            <Head title={`Usuario: ${user.name}`} />

            <div className="flex flex-1 flex-col gap-5 p-4">
                <section>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">{user.name}</h1>
                            <span className="text-muted-foreground text-sm">{t('User details')}</span>
                        </div>
                        <Button asChild>
                            <Link href={route('super-admin.users.edit', user.id)}>
                                <PencilIcon className="mr-2 h-4 w-4" />
                                Editar
                            </Link>
                        </Button>
                    </div>
                </section>

                <div className="grid gap-5 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserIcon className="h-5 w-5" />
                                {t('Personal information')}
                            </CardTitle>
                            <CardDescription>{t('Basic user details')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                                    <UserIcon className="h-4 w-4" />
                                    Nombre
                                </div>
                                <p className="mt-1 text-lg">{user.name}</p>
                            </div>
                            <Separator />
                            <div>
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                                    <MailIcon className="h-4 w-4" />
                                    Email
                                </div>
                                <p className="mt-1 text-lg">{user.email}</p>
                            </div>
                            <Separator />
                            <div>
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                                    <CalendarIcon className="h-4 w-4" />
                                    Email Verificado
                                </div>
                                <p className="mt-1">
                                    {user.email_verified_at ? (
                                        <Badge variant="default">Verificado el {formatDate(user.email_verified_at)}</Badge>
                                    ) : (
                                        <Badge variant="destructive">{t('Not verified')}</Badge>
                                    )}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldIcon className="h-5 w-5" />
                                Roles y Permisos
                            </CardTitle>
                            <CardDescription>{t('Roles assigned to this user')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="text-muted-foreground text-sm font-medium">{t('Roles')}</div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {user.roles && user.roles.length > 0 ? (
                                        user.roles.map((role) => (
                                            <Badge key={role} variant="secondary">{role}</Badge>
                                        ))
                                    ) : (
                                        <span className="text-muted-foreground text-sm">{t('No roles assigned')}</span>
                                    )}
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <div className="text-muted-foreground text-sm font-medium">{t('Permissions')}</div>
                                <div className="mt-2 max-h-48 overflow-y-auto">
                                    {user.permissions && user.permissions.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {user.permissions.map((permission) => (
                                                <Badge key={permission.id} variant="outline" className="text-xs">
                                                    {permission.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">{t('No direct permissions')}</span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5" />
                                {t('System information')}
                            </CardTitle>
                            <CardDescription>{t('Created and updated dates')}</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div>
                                <div className="text-muted-foreground text-sm font-medium">{t('Created at')}</div>
                                <p className="mt-1">{formatDate(user.created_at)}</p>
                            </div>
                            <div>
                                <div className="text-muted-foreground text-sm font-medium">{t('Last updated')}</div>
                                <p className="mt-1">{formatDate(user.updated_at)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
};

export default ShowUserPage;

