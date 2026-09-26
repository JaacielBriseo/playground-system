import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';

import AppearanceToggleDropdown from './appearance-dropdown';

import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    return (
        <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center gap-2 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex w-full items-center justify-between">
                <div className="flex min-w-0 items-center gap-2">
                    <SidebarTrigger className="-ml-1 shrink-0" />
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>

                {/* Global quick actions belong here — a "New {resource}" button, a
                    command palette trigger, notifications. Keep it to a handful. */}
                <div className="flex shrink-0 items-center gap-2">
                    <AppearanceToggleDropdown />
                </div>
            </div>
        </header>
    );
}
