import { useEffect, type ReactNode } from 'react';

import { router } from '@inertiajs/react';

import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { toast } from 'sonner';

import { useAuth } from '@/hooks/use-auth';

import type { BreadcrumbItem, SharedData } from '@/types';

interface AppLayoutProps extends Partial<SharedData> {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    const { user, isAccountOwner, isSuperAdmin, teamRole } = useAuth();

    const isTeamMember = teamRole !== null;
    const canShow = isAccountOwner || isSuperAdmin || isTeamMember;

    // All hooks must come before any conditional return (Rules of Hooks)
    useEffect(() => {
        if (!user) {
            router.visit(route('login'));
        }
    }, [user]);

    useEffect(() => {
        if (user && !canShow) {
            router.visit(route('unauthorized'));
        }
    }, [user, canShow]);

    // Depend on individual flash values, not the object reference, to avoid
    // re-firing when the flash container is replaced with the same null values
    useEffect(() => {
        if (!props.flash) return;
        Object.entries(props.flash).forEach(([type, message]) => {
            if (!message) return;
            switch (type) {
                case 'success':
                    toast.success(message);
                    break;
                case 'error':
                    toast.error(message);
                    break;
                case 'info':
                    toast.info(message);
                    break;
                case 'warning':
                    toast.warning(message);
                    break;
                default:
                    toast(message);
                    break;
            }
        });
        // Depending on props.flash itself would re-fire on every Inertia response,
        // since the object identity changes even when all four values are null.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.flash?.success, props.flash?.error, props.flash?.warning, props.flash?.info]);

    if (!user || !canShow) {
        return null;
    }

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} user={user} {...props}>
            {children}
        </AppLayoutTemplate>
    );
};
