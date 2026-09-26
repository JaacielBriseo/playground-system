import { usePage } from '@inertiajs/react';

import { hasRole, Roles } from '@/lib/permissions';

import type { SharedData } from '@/types';

export const useAuth = () => {
    const page = usePage<SharedData>();
    const user = page.props.auth.user;

    const isAuthenticated = !!user;
    const isSuperAdmin = isAuthenticated && hasRole(user, Roles.SuperAdmin);

    return { user, isAuthenticated, isSuperAdmin };
};
