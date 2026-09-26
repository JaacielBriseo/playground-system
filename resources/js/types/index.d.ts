import { Row } from '@tanstack/react-table';
import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user?: User | null;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    items?: Array<NavItem>;
}

export type NavSections = Array<NavGroup>;

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    flash: {
        success: string | null;
        error: string | null;
        warning: string | null;
        info: string | null;
    };
    timezone: string;
    beta_mode: boolean;
    /** Active locale, e.g. 'es' | 'en'. */
    locale: string;
    /** Flat source-string → translation map for the active locale. */
    translations: Record<string, string>;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    permissions: string[];
    roles: string[];
    [key: string]: unknown;
}

export interface Permission {
    id: number;
    name: string;
    guard_name: string;
    created_at: Date;
    updated_at: Date;
    pivot: RolePermissionPivot;
}

export interface RolePermissionPivot {
    role_id: number;
    permission_id: number;
}

export interface RoleModelPivot {
    model_type: string;
    model_id: number;
    role_id: number;
}

export interface Role {
    id: number;
    name: string;
    label: string;
    guard_name: string;
    created_at: Date;
    updated_at: Date;
    pivot: RoleModelPivot;
    permissions: Permission[];
}

export type PaginatedData<T> = {
    data: T[];
    links: Partial<{
        first: string;
        last: string;
        next: string;
        prev: string;
    }>;
    meta: PaginatedDataMeta;
    total_count: number;
};

export interface PaginatedDataMeta {
    current_page: number;
    from: number;
    last_page: number;
    links: PaginatedDataMetaLink[];
    path: string;
    per_page: number;
    to: number;
    total: number;
}

export interface PaginatedDataMetaLink {
    url: string | null;
    label: string;
    active: boolean;
}

export type QueryParams = Record<string, string | number | null | undefined | string[]>;

export type Nullable<T> = T | null;

export interface DataTableRowAction<TData, TAction extends string> {
    row: Row<TData>;
    type: TAction;
}

export type UnionToIntersection<U> = (U extends unknown ? (x: U) => unknown : never) extends (x: infer I) => unknown ? I : never;

export interface ApiSuccessResponse<T = undefined> {
    ok: true;
    message: string;
    data: T;
}

export interface ApiErrorResponse {
    ok: false;
    message: string;
    errors: Array<string>;
}

export type ApiResponse<T> = ApiErrorResponse | ApiSuccessResponse<T>;
