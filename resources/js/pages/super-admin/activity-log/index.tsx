import { Head } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';
import { usePageUrl } from '@/hooks/use-page-url';

import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';

import { DATE_TIME_OPTS, formatDateTime } from '@/lib/formatters/dates';
import type { PaginatedData, SharedData } from '@/types';
import { useTranslation } from '@/lib/i18n';

export interface ActivityLogResource {
    id: number;
    log_name: string | null;
    description: string;
    event: string | null;
    causer_name: string | null;
    causer_email: string | null;
    subject_type: string | null;
    subject_id: number | null;
    properties: Record<string, unknown> | null;
    created_at: string;
}

interface Props extends Partial<SharedData> {
    logs: PaginatedData<ActivityLogResource>;
}

const logNameColor: Record<string, string> = {
    saas:   'bg-blue-100 text-blue-800',
    stripe: 'bg-purple-100 text-purple-800',
};

export default function SuperAdminActivityLogPage({ logs, ...props }: Props) {
    const { t } = useTranslation();
    const { setParams, getParam } = usePageUrl();

    return (
        <AppLayout
            {...props}
            breadcrumbs={[
                { title: 'Dashboard', href: route('super-admin.index') },
                { title: 'Activity Log', href: route('super-admin.activity-log.index') },
            ]}
        >
            <Head title={t('Activity log')} />
            <div className="flex flex-1 flex-col gap-5 p-4">
                <section className="flex items-end justify-between">
                    <div>
                        <h1 className="text-2xl leading-none font-bold">{t('Activity log')}</h1>
                        <span className="text-sm text-gray-500">{logs.meta.total} eventos</span>
                    </div>
                </section>

                <section>
                    <Select
                        value={getParam('log_name') ?? 'all'}
                        onValueChange={(v) => setParams({ log_name: v === 'all' ? null : v })}
                    >
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder={t('Channel')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('All')}</SelectItem>
                            <SelectItem value="saas">SaaS</SelectItem>
                            <SelectItem value="stripe">Stripe</SelectItem>
                        </SelectContent>
                    </Select>
                </section>

                <section>
                    <Table className="border-collapse border">
                        <TableHeader>
                            <TableRow className="bg-secondary hover:bg-secondary">
                                <TableHead>{t('Channel')}</TableHead>
                                <TableHead>{t('Event')}</TableHead>
                                <TableHead>{t('Caused by')}</TableHead>
                                <TableHead>{t('Subject')}</TableHead>
                                <TableHead>{t('Date')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.data.length ? (
                                logs.data.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${logNameColor[log.log_name ?? ''] ?? 'bg-gray-100 text-gray-700'}`}
                                            >
                                                {log.log_name ?? 'default'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">{log.description}</TableCell>
                                        <TableCell>
                                            {log.causer_name ? (
                                                <div>
                                                    <div className="font-medium">{log.causer_name}</div>
                                                    <div className="text-xs text-gray-500">{log.causer_email}</div>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">{t('System')}</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {log.subject_type ? (
                                                <Badge variant="outline">
                                                    {log.subject_type} #{log.subject_id}
                                                </Badge>
                                            ) : (
                                                '—'
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-500">
                                            {formatDateTime(log.created_at, DATE_TIME_OPTS)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        Sin actividad registrada.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    <div className="bg-background flex justify-end py-3">
                        <DataTablePagination
                            pagination={{
                                links: logs.links,
                                meta: logs.meta,
                                total_count: logs.total_count,
                            }}
                        />
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}

