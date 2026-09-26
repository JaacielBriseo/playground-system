import { z } from 'zod';

import { t } from '@/lib/i18n';

// Schemas are built at module load, so they use the module-level t() rather
// than the hook. Keep these rules in sync with the backend validation in
// app/Http/Controllers/API/SuperAdmin/UsersApiController.
const baseFields = {
    name: z.string().min(1, t('Name is required')).max(255, t('Name cannot exceed 255 characters')),
    email: z.string().min(1, t('Email is required')).email(t('Email is not valid')).max(255, t('Email cannot exceed 255 characters')),
    roles: z.array(z.string()).default([]),
};

const passwordsMatch = {
    message: t('Passwords do not match'),
    path: ['password_confirmation'],
};

/** Edit form: a blank password means "leave it unchanged". */
export const userFormSchema = z
    .object({
        ...baseFields,
        password: z.string().min(8, t('Password must be at least 8 characters')).optional().or(z.literal('')),
        password_confirmation: z.string().optional().or(z.literal('')),
    })
    .refine((data) => !data.password || data.password === data.password_confirmation, passwordsMatch);

/** Create form: the password is mandatory. */
export const createUserFormSchema = z
    .object({
        ...baseFields,
        password: z.string().min(8, t('Password must be at least 8 characters')),
        password_confirmation: z.string().min(1, t('Password confirmation is required')),
    })
    .refine((data) => data.password === data.password_confirmation, passwordsMatch);

export type UserFormData = z.infer<typeof userFormSchema>;
export type CreateUserFormData = z.infer<typeof createUserFormSchema>;
