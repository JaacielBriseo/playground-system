import { usePage } from '@inertiajs/react';

import type { SharedData } from '@/types';

/**
 * Minimal i18n. No runtime dependency — the dictionary is a flat key/value map
 * shared from Laravel (see App\Support\Translations) on every Inertia response.
 *
 * Keys ARE the source string in English, so a missing translation degrades to
 * readable English rather than to a dotted key:
 *
 *     t('Save changes')                      → "Guardar cambios"
 *     t('Deleted :name', { name: 'Acme' })   → "Acme eliminado"
 *
 * Two entry points exist because translation is needed both inside React
 * (components) and outside it (the Axios interceptor in lib/api/api.ts):
 *
 *   - useTranslation() — for components. Reactive; re-renders on locale change.
 *   - t()             — module-level. Reads the last dictionary pushed by
 *                       registerTranslations(), which app.tsx wires to Inertia.
 */

type Dictionary = Record<string, string>;
type Replacements = Record<string, string | number>;

let dictionary: Dictionary = {};

/** Called by app.tsx on boot and after every Inertia navigation. */
export function registerTranslations(next: Dictionary | undefined): void {
    dictionary = next ?? {};
}

function interpolate(line: string, replacements?: Replacements): string {
    if (!replacements) return line;

    return Object.entries(replacements).reduce((carry, [key, value]) => carry.replaceAll(`:${key}`, String(value)), line);
}

/**
 * Translate outside a React component. Inside components prefer useTranslation()
 * so the text updates when the locale changes.
 */
export function t(key: string, replacements?: Replacements): string {
    return interpolate(dictionary[key] ?? key, replacements);
}

/** Translate inside a React component, bound to the current page's dictionary. */
export function useTranslation() {
    const { translations, locale } = usePage<SharedData>().props;

    return {
        locale,
        t: (key: string, replacements?: Replacements): string => interpolate(translations?.[key] ?? key, replacements),
    };
}
