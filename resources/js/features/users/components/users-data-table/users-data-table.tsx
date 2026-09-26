import { useMemo, useState } from 'react';

import {
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';

import { DataTablePagination } from '@/components/data-table/data-table-pagination';
// import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { getProductsDataTableColumns, UsersDataTableRowAction } from './users-data-table-columns';

import type { PaginatedData } from '@/types';
import type { UserResource } from '../../interfaces';
import { DeleteUserDialog } from '../delete-user-dialog';

export const UsersDataTable = (props: PaginatedData<UserResource>) => {
    const { meta, data, links, total_count } = props;
    const [rowAction, setRowAction] = useState<UsersDataTableRowAction | null>(null);

    const columns = useMemo(() => getProductsDataTableColumns({ setRowAction }), []);

    const table = useReactTable({
        data: data,
        columns: columns,
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        pageCount: meta.total ?? -1,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
    });
    return (
        <div className="flex w-full flex-1 flex-col">
            {!!rowAction && rowAction.type === 'delete' && (
                <DeleteUserDialog user={rowAction.row.original} onClose={() => setRowAction(null)} />
            )}

            <Table className="border-collapse border">
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="bg-secondary hover:bg-secondary overflow-hidden">
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id} colSpan={header.colSpan} style={{ width: header.getSize() }}>
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && 'selected'}
                                className={`hover:bg-secondary ${row.getIsExpanded() ? 'bg-secondary' : ''}`}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No hay resultados.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <div className="bg-background flex justify-end py-3">
                <DataTablePagination
                    pagination={{
                        links,
                        meta,
                        total_count,
                    }}
                />
            </div>
        </div>
    );
};
