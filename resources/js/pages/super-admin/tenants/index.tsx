import { Head, router } from '@inertiajs/react';

import { EyeIcon, MoreHorizontalIcon } from 'lucide-react';

import { usePageUrl } from '@/hooks/use-page-url';
import AppLayout from '@/layouts/app-layout';
import { formatDateTime } from '@/lib/formatters/dates';
import { useTranslation } from '@/lib/i18n';

import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { subscriptionStatusConfig, type TenantResource } from '@/features/tenants/interfaces';

import type { PaginatedData, SharedData } from '@/types';

interface Props extends Partial<SharedData> {
    tenants: PaginatedData<TenantResource>;
}

export default function SuperAdminTenantsPage({ tenants, ...props }: Props) {
    const { setParams, getParam } = usePageUrl();
    const { t } = useTranslation();

    // Support session: server puts the tenant in the session and redirects into
    // /admin, where ImpersonationBanner offers the way back out.
    const impersonate = (tenant: TenantResource) => router.post(route('super-admin.tenants.impersonate', tenant.id));

    const setSuspended = (tenant: TenantResource, suspend: boolean) =>
        router.post(route(suspend ? 'super-admin.tenants.suspend' : 'super-admin.tenants.reactivate', tenant.id));

    return (
        <AppLayout
            {...props}
            breadcrumbs={[
                { title: t('Dashboard'), href: route('super-admin.index') },
                { title: t('Tenants'), href: route('super-admin.tenants.index') },
            ]}
        >
            <Head title={t('Tenants')} />
            <div className="flex flex-1 flex-col gap-5 p-4">
                <section className="flex items-end justify-between">
                    <div>
                        <h1 className="text-2xl leading-none font-bold">{t('Tenants')}</h1>
                        <span className="text-muted-foreground text-sm">{t(':count total', { count: tenants.meta.total })}</span>
                    </div>
                </section>

                <section>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const fd = new FormData(e.currentTarget);
                            setParams({ search: fd.get('search')?.toString() || null });
                        }}
                        className="flex max-w-[15rem]"
                    >
                        <Input
                            name="search"
                            placeholder={t('Search tenants…')}
                            defaultValue={getParam('search') || undefined}
                            onChange={(e) => {
                                if (e.target.value === '') setParams({ search: null });
                            }}
                        />
                    </form>
                </section>

                <section>
                    <Table className="border-collapse border">
                        <TableHeader>
                            <TableRow className="bg-secondary hover:bg-secondary">
                                <TableHead>{t('ID')}</TableHead>
                                <TableHead>{t('Name')}</TableHead>
                                <TableHead>{t('Status')}</TableHead>
                                <TableHead>{t('Users')}</TableHead>
                                <TableHead>{t('Payment method')}</TableHead>
                                <TableHead>{t('Trial ends')}</TableHead>
                                <TableHead>{t('Registered')}</TableHead>
                                <TableHead className="w-[1%]" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tenants.data.length ? (
                                tenants.data.map((tenant) => {
                                    const status = subscriptionStatusConfig[tenant.subscription_status];
                                    const suspended = tenant.status === 'suspended';

                                    return (
                                        <TableRow key={tenant.id} className={suspended ? 'opacity-60' : undefined}>
                                            <TableCell>{tenant.id}</TableCell>
                                            <TableCell className="font-medium">{tenant.name}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <Badge variant={status.variant}>{t(status.label)}</Badge>
                                                    {suspended && <Badge variant="destructive">{t('Suspended')}</Badge>}
                                                </div>
                                            </TableCell>
                                            <TableCell>{tenant.users_count}</TableCell>
                                            <TableCell>{tenant.pm_last_four ? `•••• ${tenant.pm_last_four}` : '—'}</TableCell>
                                            <TableCell>{tenant.trial_ends_at ? formatDateTime(tenant.trial_ends_at) : '—'}</TableCell>
                                            <TableCell>{formatDateTime(tenant.created_at)}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontalIcon className="h-4 w-4" />
                                                            <span className="sr-only">{t('Actions')}</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => impersonate(tenant)}>
                                                            <EyeIcon className="mr-2 h-4 w-4" />
                                                            {t('View as tenant')}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => setSuspended(tenant, !suspended)}
                                                            className={suspended ? undefined : 'text-destructive focus:text-destructive'}
                                                        >
                                                            {suspended ? t('Reactivate') : t('Suspend')}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center">
                                        {t('No tenants yet.')}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    <div className="bg-background flex justify-end py-3">
                        <DataTablePagination
                            pagination={{
                                links: tenants.links,
                                meta: tenants.meta,
                                total_count: tenants.total_count,
                            }}
                        />
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
