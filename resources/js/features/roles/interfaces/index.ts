export interface Role {
    id: number;
    name: string;
    label: string;
}

export interface RoleResource {
    id: number;
    name: string;
    label: string;
    users_count?: number;
    permissions?: Array<{ id: number; name: string }>;
}

export interface RoleWithPermissions extends RoleResource {
    permissions: Array<{ id: number; name: string }>;
}
