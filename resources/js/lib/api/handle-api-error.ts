import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';

import { ApiError } from './api-error';

// The second and third UseFormReturn generics (context, transformed values) are
// irrelevant here — this only ever calls setError — so they stay unconstrained.
export function handleApiError<T extends FieldValues>(error: unknown, form?: UseFormReturn<T, unknown, T>): void {
    if (error instanceof ApiError) {
        toast.error(error.message);

        if (form && Object.keys(error.errors).length > 0) {
            for (const [field, messages] of Object.entries(error.errors)) {
                form.setError(field as Path<T>, { message: messages[0] });
            }
        }

        return;
    }

    if (error instanceof Error) {
        toast.error(error.message);
        return;
    }

    toast.error('Ha ocurrido un error inesperado.');
}
