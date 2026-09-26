import { createInertiaApp, router } from '@inertiajs/react';

import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

import { setAppTimezone } from '@/lib/formatters/dates';
import { registerTranslations } from '@/lib/i18n';

import { Toaster } from '@/components/ui/sonner';

import '../css/app.css';
import { initializeTheme } from './hooks/use-appearance';

import type { SharedData } from '@/types';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const sharedProps = props.initialPage.props as Partial<SharedData>;
        setAppTimezone(sharedProps.timezone);
        registerTranslations(sharedProps.translations);

        // Keeps the module-level t() (used outside React, e.g. the Axios
        // interceptor) in step with the locale after client-side navigation.
        router.on('success', (event) => {
            registerTranslations((event.detail.page.props as Partial<SharedData>).translations);
        });

        const root = createRoot(el);

        root.render(
            <>
                <App {...props} />
                <Toaster position="top-center" />
            </>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

initializeTheme();
