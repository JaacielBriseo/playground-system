import type { route as routeFn } from 'ziggy-js';

declare global {
    const route: typeof routeFn;
    const shared: SharedData;
    const google: typeof globalThis.google;
}
