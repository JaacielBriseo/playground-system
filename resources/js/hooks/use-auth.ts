import { usePage } from '@inertiajs/react';

import { hasRole, Roles } from '@/lib/permissions';

import type { SharedData } from '@/types';

export const useAuth = () => {
    const page = usePage<SharedData>();
    const user = page.props.auth.user;
    const teamRole = page.props.auth.team_role ?? null;

    const isAuthenticated = !!user;
    const isAccountOwner = isAuthenticated && hasRole(user, Roles.AccountOwner);
    const isSuperAdmin = isAuthenticated && hasRole(user, Roles.SuperAdmin);
    const isTeamOwner = teamRole === 'owner';
    const tenant = page.props.auth.tenant ?? null;

    return { user, isAuthenticated, isAccountOwner, isSuperAdmin, teamRole, isTeamOwner, tenant };
};
