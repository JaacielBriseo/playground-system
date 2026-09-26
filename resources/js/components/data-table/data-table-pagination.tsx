import { usePageUrl } from '@/hooks/use-page-url';

import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import type { PaginatedData } from '@/types';
import { useTranslation } from '@/lib/i18n';

interface Props {
    pagination: Omit<PaginatedData<unknown>, 'data'>;
}

const perPageOptions = [15, 25, 50, 100]; // customize as needed

export const DataTablePagination = ({ pagination }: Props) => {
    const { t } = useTranslation();
    const { setParams } = usePageUrl();
    const { meta, links } = pagination;
    const { current_page, last_page, per_page } = meta;

    const totalPages = last_page;
    const hasPrev = !!links.prev;
    const hasNext = !!links.next;

    const handlePageChange = (newPage: number) => {
        setParams({
            page: newPage,
        });
    };

    const handlePerPageChange = (newPerPage: number) => {
        setParams({
            page: 1,
            per_page: newPerPage,
        });
    };

    return (
        <div className="flex flex-wrap items-center gap-5">
            <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">{t('Rows per page:')}</p>
                <Select value={`${per_page}`} onValueChange={(value) => handlePerPageChange(Number(value))}>
                    <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent side="top">
                        {perPageOptions.map((pageSize) => (
                            <SelectItem key={pageSize} value={`${pageSize}`}>
                                {pageSize}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Pagination className="w-auto">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            label={t('Previous')}
                            onClick={(e) => {
                                e.preventDefault();
                                if (hasPrev) handlePageChange(current_page - 1);
                            }}
                            className={!hasPrev ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => {
                            return p === 1 || p === totalPages || (p >= current_page - 1 && p <= current_page + 1);
                        })
                        .map((p, i, arr) => {
                            const showEllipsisBefore = i > 0 && arr[i - 1] !== p - 1;
                            const showEllipsisAfter = i < arr.length - 1 && arr[i + 1] !== p + 1;

                            return (
                                <div key={p} className="flex items-center">
                                    {showEllipsisBefore && (
                                        <PaginationItem>
                                            <span className="px-2">...</span>
                                        </PaginationItem>
                                    )}
                                    <PaginationItem>
                                        <PaginationLink
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handlePageChange(p);
                                            }}
                                            isActive={current_page === p}
                                            className="cursor-pointer"
                                        >
                                            {p}
                                        </PaginationLink>
                                    </PaginationItem>
                                    {showEllipsisAfter && (
                                        <PaginationItem>
                                            <span className="px-2">...</span>
                                        </PaginationItem>
                                    )}
                                </div>
                            );
                        })}

                    <PaginationItem>
                        <PaginationNext
                            label={t('Next')}
                            onClick={(e) => {
                                e.preventDefault();
                                if (hasNext) handlePageChange(current_page + 1);
                            }}
                            className={!hasNext ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
};

