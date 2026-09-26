import { usePage } from '@inertiajs/react';
import { XIcon } from 'lucide-react';
import { useState } from 'react';

import type { SharedData } from '@/types';

export function BetaBanner() {
    const { beta_mode } = usePage<SharedData>().props;
    const [dismissed, setDismissed] = useState(false);

    if (!beta_mode || dismissed) return null;

    return (
        <div className="relative flex items-center justify-center bg-yellow-400 px-4 py-2 text-sm font-medium text-yellow-900">
            <span>
                This app is in <strong>beta</strong>. Payments/subscriptions are in test mode — no real charges apply. Collected data may be reset
                before launch.
            </span>
            <button onClick={() => setDismissed(true)} className="absolute right-3 p-1 hover:opacity-70" aria-label="Dismiss beta notice">
                <XIcon className="h-4 w-4" />
            </button>
        </div>
    );
}
