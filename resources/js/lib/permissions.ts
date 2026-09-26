import type { User } from '@/types';

export const can = (user: User, permission: string) => {
    return user?.permissions?.some((p) => p === permission);
};

export const hasRole = (user: User | null | undefined, role: Role) => {
    return user?.roles?.some((r) => r === role) ?? false;
};

export const hasSomeRole = (user: User | null | undefined, roles: Array<Role>) => {
    return roles.some((role) => hasRole(user, role));
};

export const Roles = {
    SuperAdmin: 'super_admin',
    User: 'user',
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];
