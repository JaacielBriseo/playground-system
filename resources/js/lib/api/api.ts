import axios, { AxiosError, AxiosInstance } from 'axios';

import type { RoleResource } from '@/features/roles/interfaces';
import type { UserResource } from '@/features/users/interfaces';
import { t } from '@/lib/i18n';
import { getCsrfToken } from '@/lib/utils';

import { ApiError } from './api-error';
import type { ApiResponse } from './interfaces';

const apiClient: AxiosInstance = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-CSRF-TOKEN': getCsrfToken(),
    },
    withCredentials: true,
});

apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
        if (error.response?.data) {
            const { message, errors } = error.response.data;
            return Promise.reject(new ApiError(message ?? t('Unknown error'), errors ?? {}, error.response.status));
        }
        return Promise.reject(error);
    },
);

// Super-admin: Users
const users = {
    create: async (data: { name: string; email: string; password: string; password_confirmation: string; roles?: string[] }) =>
        (await apiClient.post<ApiResponse<UserResource>>('/super-admin/users', data)).data,

    update: async (id: number, data: { name?: string; email?: string; password?: string; password_confirmation?: string; roles?: string[] }) =>
        (await apiClient.post<ApiResponse<UserResource>>(`/super-admin/users/${id}`, data)).data,

    delete: async (id: number) =>
        (await apiClient.delete<ApiResponse<unknown>>(`/super-admin/users/${id}`)).data,
};

// Super-admin: Roles
const roles = {
    create: async (data: { name: string; label: string; permissions?: number[] }) =>
        (await apiClient.post<ApiResponse<RoleResource>>('/super-admin/roles', data)).data,

    update: async (id: number, data: { name: string; label: string; permissions?: number[] }) =>
        (await apiClient.post<ApiResponse<RoleResource>>(`/super-admin/roles/${id}`, data)).data,

    delete: async (id: number) =>
        (await apiClient.delete<ApiResponse<unknown>>(`/super-admin/roles/${id}`)).data,
};

/**
 * Every mutation goes through this object — components never call axios directly.
 * Add one namespace per domain module, mirroring routes/api.php.
 */
export const api = { users, roles };


