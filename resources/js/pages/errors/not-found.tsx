import { router } from '@inertiajs/react';

import { ArrowLeft, FileSearch } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';

export default function NotFoundPage() {
    const { t } = useTranslation();
    return (
        <div className="bg-background flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-md text-center">
                <div className="mb-8">
                    <div className="bg-muted mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full">
                        <FileSearch className="text-muted-foreground h-12 w-12" />
                    </div>
                    <p className="text-muted-foreground mb-1 text-sm font-semibold tracking-widest uppercase">{t('Error 404')}</p>
                    <h1 className="mb-3 text-3xl font-bold tracking-tight">{t('Page not found')}</h1>
                    <p className="text-muted-foreground">{t('The page you are looking for does not exist or has moved. Check the URL or go back home.')}</p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button variant="outline" onClick={() => window.history.length > 1 ? window.history.back() : router.visit(route('home'))}>
                        <ArrowLeft className="h-4 w-4" />
                        {t('Go back')}
                    </Button>
                    <Button onClick={() => router.visit(route('home'))}>{t('Go home')}</Button>
                </div>
            </div>
        </div>
    );
}

