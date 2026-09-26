<?php

namespace App\Http\Middleware;

use App\Http\Resources\UserResource;
use App\Support\Translations;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {

        $user = $request->user()?->loadMissing('roles', 'permissions', 'teamMember', 'tenant');

        $tenantData = null;
        if ($user?->tenant_id) {
            $tenantData = [
                'name'    => $user->tenant?->name,
                'is_solo' => $user->tenant->users()->count() <= 1,
            ];
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user'      => $user ? new UserResource($user) : null,
                'team_role' => $user?->teamMember?->role,
                'tenant'    => $tenantData,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'info' => $request->session()->get('info'),
            ],
            // 'ziggy' => fn(): array => [
            //     ...(new Ziggy)->toArray(),
            //     'location' => $request->url(),
            // ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'timezone'    => config('app.display_timezone'),
            'beta_mode'   => (bool) config('app.beta_mode'),

            // i18n — the active locale and its flat key/value dictionary.
            // Lazily evaluated so partial reloads do not re-ship the whole dictionary.
            'locale'       => app()->getLocale(),
            'translations' => fn (): array => Translations::forLocale(app()->getLocale()),

            // Super admin support sessions: drives the persistent "exit impersonation" banner.
            // Read from the session rather than the `is_impersonating` request attribute —
            // Inertia::share() runs before route middleware, so RoleWithImpersonation has
            // not set that attribute yet. The tenant name is stashed at impersonation start
            // to keep this free of a per-request query.
            'is_impersonating'  => fn (): bool => $request->session()->has('impersonated_tenant_id'),
            'impersonated_name' => fn (): ?string => $request->session()->get('impersonated_tenant_name'),
        ];
    }
}
