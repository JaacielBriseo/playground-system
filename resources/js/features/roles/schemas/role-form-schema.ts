import { z } from 'zod';

import { t } from '@/lib/i18n';

// Schemas are built at module load, so they use the module-level t() rather
// than the hook. Keep these rules in sync with the backend validation in
// app/Http/Requests/Role/*.
export const roleFormSchema = z.object({
    name: z
        .string()
        .min(1, t('Required'))
        .max(50)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, t('Lowercase letters, numbers and dashes only (e.g. account-owner)')),
    label: z.string().min(1, t('Required')).max(50),
    permissions: z.array(z.number()).optional(),
});

export type RoleFormData = z.infer<typeof roleFormSchema>;
