import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { QueryParams } from '@/types';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Creates a query object to be passed to Inertia's router (GET).
 * It merges the existing search parameters with the new ones,
 * removing any keys with null/undefined/empty values,
 * and sorts the final query keys alphabetically.
 */
export function createSearchParams(currentSearchParams: URLSearchParams | QueryParams, newParams: QueryParams): QueryParams {
    const mergedParams: QueryParams = {};

    // Convert URLSearchParams to plain object if needed
    const baseParams: QueryParams =
        currentSearchParams instanceof URLSearchParams ? Object.fromEntries(currentSearchParams.entries()) : currentSearchParams;

    // Merge and clean up
    const combined = { ...baseParams, ...newParams };

    const cleanedEntries = Object.entries(combined).filter(([, value]) => {
        return !(value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0));
    });

    // Sort keys alphabetically
    const sortedEntries = cleanedEntries.sort(([a], [b]) => a.localeCompare(b));

    for (const [key, value] of sortedEntries) {
        mergedParams[key] = Array.isArray(value) ? value.join(',') : value;
    }

    return mergedParams;
}

export function getCsrfToken(): string {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
}
