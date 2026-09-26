import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DeleteRoleDialog } from '@/features/roles/components/delete-role-dialog';
import { RoleFormDialog } from '@/features/roles/components/role-form-dialog';
import AppLayout from '@/layouts/app-layout';
import { Permission, Role, BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { PencilIcon, PlusCircleIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';

type RoleItem = Pick<Role, 'id' | 'name' | 'label' | 'pivot'> & { users_count: number };
type PermissionItem = Pick<Permission, 'id' | 'name' | 'pivot'>;
interface PermissionWithRoles extends PermissionItem {
    roles: Array<RoleItem>;
}

interface RoleWithPermissions extends RoleItem {
    permissions: Array<PermissionItem>;
}

interface Props {
    roles: Array<RoleWithPermissions>;
    permissions: Array<PermissionWithRoles>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('super-admin.index') },
    { title: 'Roles', href: route('super-admin.roles.index') },
];

const SuperAdminRolesPage = ({ roles }: Props) => {
    const { t } = useTranslation();
    const [openRoleForm, setOpenRoleForm] = useState(false);
    const [editingRole, setEditingRole] = useState<RoleWithPermissions>();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Roles')} />
            {(openRoleForm || !!editingRole) && (
                <RoleFormDialog
                    open
                    onOpenChange={(open) => {
                        setOpenRoleForm(open);
                        if (!open) setEditingRole(undefined);
                    }}
                    initialData={
                        editingRole
                            ? { ...editingRole, permissions: editingRole.permissions.map((p) => p.id) }
                            : undefined
                    }
                />
            )}
            <main className="flex flex-col gap-5 p-4">
                <section>
                    <h1 className="text-3xl font-semibold">{t('Roles')}</h1>
                </section>
                <section>
                    <Button onClick={() => setOpenRoleForm(true)}>
                        <PlusCircleIcon className="size-5" strokeWidth={1.75} />
                        Crear rol
                    </Button>
                </section>
                <section>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>{t('Name')}</TableHead>
                                <TableHead>{t('Label')}</TableHead>
                                <TableHead>{t('Users')}</TableHead>
                                <TableHead>{t('Actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles.map((role) => (
                                <TableRow key={role.id}>
                                    <TableCell>{role.id}</TableCell>
                                    <TableCell>{role.name}</TableCell>
                                    <TableCell>{role.label}</TableCell>
                                    <TableCell>{role.users_count}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                onClick={() => setEditingRole(role)}
                                                variant="outline"
                                                size="icon"
                                                className="cursor-pointer rounded-full"
                                            >
                                                <PencilIcon className="size-4" />
                                            </Button>
                                            <DeleteRoleDialog roleId={role.id} roleLabel={role.label} disabled={role.users_count > 0} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </section>
            </main>
        </AppLayout>
    );
};

export default SuperAdminRolesPage;

