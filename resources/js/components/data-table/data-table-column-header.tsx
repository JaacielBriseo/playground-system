import type { Column } from '@tanstack/react-table';

import { Button, type ButtonProps } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePageUrl } from '@/hooks/use-page-url';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from 'lucide-react';

interface ColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
    column: Column<TData, TValue>;
    title: string;
    buttonProps?: ButtonProps;
}

export const DataTableColumnHeader = <TData, TValue>({ column, title, className, buttonProps }: ColumnHeaderProps<TData, TValue>) => {
    const { getParam, setParams } = usePageUrl();

    if (!column.getCanSort()) {
        return <div className={cn(className, 'truncate text-sm leading-4 font-semibold')}>{title}</div>;
    }

    const sortParam = getParam('sort');
    const [sortColumn, sortOrder] = sortParam?.split('.') ?? [];

    const isColumnSorted = sortColumn === column.id;
    const isDesc = sortOrder === 'desc';

    const handleToggle = (order: 'asc' | 'desc') => {
        setParams({
            sort: `${column.id}.${order}`,
            page: 1, // Reset to first page when sorting
        });
    };

    return (
        <div className={cn('flex items-center space-x-2', className)}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn('data-[state=open]:bg-accent -ml-3 h-8', buttonProps?.className)}
                        {...buttonProps}
                    >
                        <span className="truncate text-sm leading-4 font-semibold">{title}</span>
                        {!isColumnSorted ? (
                            <ChevronsUpDown className="ml-2 h-4 w-4" />
                        ) : isDesc ? (
                            <ArrowDown className="text-primary ml-2 h-4 w-4" />
                        ) : (
                            <ArrowUp className="text-primary ml-2 h-4 w-4" />
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => handleToggle('asc')}>
                        <ArrowUp className="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
                        Asc
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggle('desc')}>
                        <ArrowDown className="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
                        Desc
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
                        <EyeOff className="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
                        Hide
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};
