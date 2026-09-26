import { useState } from 'react';

import { handleApiError } from '@/lib/api/handle-api-error';

export function useApiDelete() {
    const [isDeleting, setIsDeleting] = useState(false);

    const deleteAsync = async <T>(promise: Promise<T>): Promise<T | undefined> => {
        try {
            setIsDeleting(true);
            return await promise;
        } catch (error) {
            handleApiError(error);
            return undefined;
        } finally {
            setIsDeleting(false);
        }
    };

    return { deleteAsync, isDeleting };
}
