import { Link } from '@inertiajs/react';

import type { ColumnDef } from '@tanstack/react-table';
import { EyeIcon, MoreVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react';

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { formatDateTime } from '@/lib/formatters/dates';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import type { DataTableRowAction } from '@/types';
import { UserResource } from '../../interfaces';

export type UsersDataTableRowAction = DataTableRowAction<UserResource, 'delete'>;

interface Props {
    setRowAction: React.Dispatch<React.SetStateAction<UsersDataTableRowAction | null>>;
}

export const getProductsDataTableColumns = ({ setRowAction }: Props): ColumnDef<UserResource>[] => [
    {
        accessorKey: 'id',
        header: (props) => <DataTableColumnHeader {...props} title="ID" />,
    },
    {
        accessorKey: 'name',
        header: (props) => <DataTableColumnHeader {...props} title="Name" />,
    },
    {
        accessorKey: 'email',
        header: (props) => <DataTableColumnHeader {...props} title="Email" />,
    },
    {
        accessorKey: 'roles',
        header: (props) => <DataTableColumnHeader {...props} title="Roles" />,
        cell: ({ row }) => {
            const user = row.original;
            return <div>{user.roles?.join(', ')}</div>;
        },
    },
    {
        accessorKey: 'created_at',
        header: (props) => <DataTableColumnHeader {...props} title="Created At" />,
        cell: ({ row }) => (row.original.created_at ? formatDateTime(row.original.created_at) : '—'),
    },
    {
        accessorKey: 'actions',
        header: (props) => <DataTableColumnHeader {...props} title="Actions" />,
        enableSorting: false,
        cell: ({ row }) => {
            const user = row.original;
            return (
                <div className="flex items-center gap-2">
                    <Button asChild variant="link">
                        <Link href={route('super-admin.users.edit', user.id)}>
                            <PencilIcon /> Edit
                        </Link>
                    </Button>
                    <Button asChild variant="link">
                        <Link href={route('super-admin.users.show', user.id)}>
                            <EyeIcon /> View
                        </Link>
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVerticalIcon />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem
                                onClick={() => setRowAction({ row, type: 'delete' })}
                                className="group hover:!text-primary flex cursor-pointer items-center gap-2 transition-colors"
                            >
                                <Trash2Icon className="group-hover:text-primary size-4 transition-colors" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];
