import { router, usePage } from '@inertiajs/react';

import { EyeIcon } from 'lucide-react';

import { useTranslation } from '@/lib/i18n';

import { Button } from '@/components/ui/button';

import type { SharedData } from '@/types';

/**
 * Persistent reminder that a super admin is inside a tenant support session,
 * with the exit control always within reach.
 *
 * Without this the only way out is to know the /super-admin URL, which makes it
 * easy to keep operating as the tenant by accident. The session also expires on
 * its own after 30 minutes — see App\Http\Middleware\RoleWithImpersonation.
 */
export function ImpersonationBanner() {
    const { is_impersonating, impersonated_name } = usePage<SharedData>().props;
    const { t } = useTranslation();

    if (!is_impersonating) {
        return null;
    }

    return (
        <div
            role="status"
            className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-amber-500 px-4 py-2 text-center text-sm font-medium text-amber-950"
        >
            <span className="flex items-center gap-1.5">
                <EyeIcon className="h-4 w-4 shrink-0" />
                {t('Viewing as :tenant', { tenant: impersonated_name ?? '' })}
            </span>
            <Button
                size="sm"
                variant="outline"
                className="h-7 border-amber-950/30 bg-transparent hover:bg-amber-950/10"
                onClick={() => router.post(route('super-admin.impersonation.stop'))}
            >
                {t('Exit support session')}
            </Button>
        </div>
    );
}
