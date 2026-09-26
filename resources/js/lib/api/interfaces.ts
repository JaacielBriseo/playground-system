import type { UserResource } from '@/features/users/interfaces';

// API Response interfaces
export interface ApiResponse<T> {
    ok: true;
    message: string;
    data: T;
}

export interface ApiErrorResponse {
    ok: false;
    message: string;
    errors?: Record<string, string[]>;
}

// User API response types
export interface UserListResponse {
    users: {
        data: UserResource[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        search?: string;
    };
    pagination: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
}

export interface UserResponse {
    success: boolean;
    message?: string;
    data: UserResource;
}

export interface UserCreateRequest {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    roles?: string[];
}

export interface UserUpdateRequest {
    name?: string;
    email?: string;
    password?: string;
    password_confirmation?: string;
    roles?: string[];
}
