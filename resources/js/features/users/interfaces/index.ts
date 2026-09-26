import { Nullable, Permission } from '@/types';

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: Nullable<string | Date>;
    password?: string;
    remember_token: Nullable<string>;
    created_at: Nullable<string | Date>;
    updated_at: Nullable<string | Date>;
}

export interface UserResource {
    id: number;
    name: string;
    email: string;
    email_verified_at: Nullable<string | Date>;
    created_at: Nullable<string | Date>;
    updated_at: Nullable<string | Date>;
    roles?: string[];
    permissions?: Array<Permission & { pivot: { role_id: number; permission_id: number } }>;
}

export interface Role {
    id: number;
    name: string;
    label: string;
}
