import { createSearchParams } from '@/lib/utils';
import { router, usePage } from '@inertiajs/react';
import { useCallback, useMemo } from 'react';

export const usePageUrl = () => {
    const { url } = usePage();
    const [pathname, rawSearchParams] = url.split('?');
    const currentRoute = route().current() || '';

    const searchParams = useMemo(() => new URLSearchParams(rawSearchParams ?? ''), [rawSearchParams]);

    const getParam = useCallback(
        (key: string): string | null => {
            return searchParams.get(key);
        },
        [searchParams],
    );

    const getAllParams = useCallback(() => {
        const result: Record<string, string> = {};
        for (const [key, value] of searchParams.entries()) {
            result[key] = value;
        }
        return result;
    }, [searchParams]);

    const setParams = useCallback(
        (newParams: Record<string, string | number | null | undefined>, options: { preserveState?: boolean; replace?: boolean } = {}) => {
            const newSearchString = createSearchParams(searchParams, newParams);
            router.get(route(currentRoute), newSearchString, {
                preserveState: options.preserveState ?? true,
                replace: options.replace ?? false,
            });
        },
        [searchParams, currentRoute],
    );

    const clearParams = useCallback(() => {
        router.get(route(currentRoute));
    }, [currentRoute]);

    return {
        pathname,
        searchParams, // raw object if you need
        getParam,
        getAllParams,
        setParams,
        clearParams,
        fullUrl: url,
    };
};
