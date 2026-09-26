import { Head, Link } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';

import { UsersDataTable } from '@/features/users/components/users-data-table/users-data-table';
import { UsersDataTableToolbar } from '@/features/users/components/users-data-table/users-data-table-toolbar';
import type { UserResource } from '@/features/users/interfaces';

import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';

import type { PaginatedData, SharedData } from '@/types';
import { useTranslation } from '@/lib/i18n';

interface Props extends Partial<SharedData> {
    users: PaginatedData<UserResource>;
}

const SuperAdminUsersPage = (props: Props) => {
    const { t } = useTranslation();
    const users = props.users;
    return (
        <AppLayout
            {...props}
            breadcrumbs={[
                { title: 'Dashboard', href: route('super-admin.index') },
                { title: 'Usuarios', href: route('super-admin.users.index') },
            ]}
        >
            <Head title={t('Users')} />

            <div className="flex flex-1 flex-col gap-5 p-4">
                <section>
                    <div className="flex items-end justify-between">
                        <div>
                            <div className="flex items-end gap-1">
                                <h1 className="m-0 text-2xl leading-none font-bold">{t('Users')}</h1>
                                <span className="text-sm text-gray-500">({users.meta.total})</span>
                            </div>
                            <span className="text-muted-foreground text-sm">{t('User administration')}</span>
                        </div>
                        <Button asChild>
                            <Link href={route('super-admin.users.create')}>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Crear Usuario
                            </Link>
                        </Button>
                    </div>
                </section>
                <section>
                    <UsersDataTableToolbar />
                </section>
                <section>
                    <UsersDataTable {...users} />
                </section>
            </div>
        </AppLayout>
    );
};

export default SuperAdminUsersPage;

