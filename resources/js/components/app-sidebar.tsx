import { Link } from '@inertiajs/react';

import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from '@/lib/i18n';
import { getAccountOwnerNavItems, getSuperAdminNavItems } from '@/lib/routes';

import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

import AppLogo from './app-logo';

import type { NavItem } from '@/types';

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { isSuperAdmin, isAccountOwner, teamRole, tenant } = useAuth();
    const { t } = useTranslation();

    const rawNavSections = isSuperAdmin ? getSuperAdminNavItems() : getAccountOwnerNavItems();

    // Team management and subscription are account_owner only — strip them for team members.
    // route() returns a branded RouteUrl, so widen to string to compare against NavItem.href.
    const ownerOnlyRoutes = new Set<string>([String(route('admin.team.index')), String(route('admin.subscription.status'))]);
    const navSections = isAccountOwner || isSuperAdmin
        ? rawNavSections
        : rawNavSections.map((section) => ({
              ...section,
              items: section.items.filter((item) => !ownerOnlyRoutes.has(item.href)),
          }));
    const homeHref = isSuperAdmin ? route('super-admin.index') : route('admin.index');

    const roleLabel = teamRole === 'member' ? t('Member') : t('Owner');
    const showTeamBlock = !isSuperAdmin && !!tenant && !tenant.is_solo;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={homeHref} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

                {showTeamBlock && (
                    <div className="group-data-[collapsible=icon]:hidden px-2 pb-1">
                        <p className="text-sidebar-foreground/80 truncate text-xs font-medium leading-tight">{tenant.name}</p>
                        <p className="text-sidebar-foreground/50 truncate text-xs leading-tight">{roleLabel}</p>
                    </div>
                )}
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navSections} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
