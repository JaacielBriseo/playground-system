# Architecture & Development Guide

---

## Table of Contents

1. [What This Template Is](#1-what-this-template-is)
2. [Development Commands](#2-development-commands)
3. [Architecture Overview](#3-architecture-overview)
4. [Routing Conventions](#4-routing-conventions)
5. [Backend Patterns — Quick Reference](#5-backend-patterns--quick-reference)
6. [Frontend Patterns — Quick Reference](#6-frontend-patterns--quick-reference)
7. [SaaS & Tenancy Rules](#7-saas--tenancy-rules)
8. [Stripe & Subscription Rules](#8-stripe--subscription-rules)
9. [Internationalisation](#9-internationalisation)
10. [Validation Conventions](#10-validation-conventions)
11. [TypeScript Conventions](#11-typescript-conventions)
12. [Custom Hooks](#12-custom-hooks)
13. [Adding a New Module — Checklist](#13-adding-a-new-module--checklist)
14. [Hard Rules — Never Violate](#14-hard-rules--never-violate)
15. [Starting a New Project From This Template](#15-starting-a-new-project-from-this-template)

---

## 1. What This Template Is

A multi-tenant SaaS starting point: tenant isolation, roles and permissions, Stripe
subscriptions that gate access, team invitations, and a super admin console with
tenant impersonation. It ships **no domain code** — you add that.

**What it is NOT:**

- Not a schema-per-tenant or subdomain-per-tenant system (single DB, `tenant_id` column)
- Not a feature-tiered SaaS (subscription is active/inactive — no plan logic)
- Not an offline-first app (no service workers, no local sync)
- Not a starting point for anything that does not have paying accounts

**Reference files:**

- Product decisions and domain language for *your* project → `CONTEXT.md`
- The three access surfaces and how they are separated → §3 and §4 below

---

## 2. Development Commands

```bash
# Start the development environment (Docker)
docker compose -f docker-compose.dev.yml up

# Migrations and seed data
docker compose -f docker-compose.dev.yml exec app php artisan migrate
docker compose -f docker-compose.dev.yml exec app php artisan db:seed

# Tests run on in-memory SQLite, so these also work without Docker
php artisan test
./vendor/bin/pint             # formatting
./vendor/bin/phpstan analyse  # static analysis
npm run types                 # tsc --noEmit
npm run lint                  # eslint
npm run build

# App:   http://localhost:8000
# Mail:  http://localhost:8025   (mailpit catches everything in dev)
# Vite:  http://localhost:5173

# Stripe webhooks, locally
stripe listen --forward-to http://localhost:8000/stripe/webhook
```

---

## 3. Architecture Overview

### Stack

| Layer            | Choice                       |
| ---------------- | ---------------------------- |
| Backend          | Laravel 13, PHP 8.3+         |
| Auth             | Laravel Sanctum (SPA mode)   |
| RBAC             | Spatie Permission            |
| Activity log     | Spatie ActivityLog           |
| Payments         | Stripe via Laravel Cashier   |
| Frontend bridge  | Inertia.js v2                |
| Frontend         | React 19, TypeScript         |
| Styling          | Tailwind CSS v4              |
| UI primitives    | shadcn/ui + Radix UI         |
| Tables           | TanStack Table v8            |
| Forms            | react-hook-form + Zod        |
| HTTP client      | Axios                        |
| Build tool       | Vite 7                       |
| Route generation | Ziggy                        |
| Database         | MySQL 8.4 (SQLite for tests) |

### The three access surfaces

They never share a middleware group. That separation is the point — a super admin
cannot fall into tenant routes by accident, and vice versa.

| Module          | Prefix         | Middleware                                                            |
| --------------- | -------------- | --------------------------------------------------------------------- |
| **Public**      | `/`            | `guest` or none                                                       |
| **Admin**       | `/admin`       | `auth, verified, role:account_owner\|team_member, subscription.active` |
| **Super Admin** | `/super-admin` | `auth, verified, role:super_admin`                                    |

### Request lifecycle

**Page load (GET → Inertia):**

```
Browser GET → admin.php routes → middleware → Inertia Controller → render(Page, props)
```

**Mutation (POST/PUT/DELETE → JSON API):**

```
React form → api.ts (Axios) → api.php routes → API Controller → validate → DTO → Service → Resource → successResponse()
```

**Error path:**

```
Laravel 422 → handleApiError(error, form) → toast.error() + form.setError() per field
```

### Backend layer responsibilities

| Layer                | Responsibility                                 | What it must NOT do                |
| -------------------- | ---------------------------------------------- | ---------------------------------- |
| Controller (Inertia) | Render pages with data                         | Contain business logic             |
| Controller (API)     | Validate input, call service, return response  | Contain business logic             |
| Service              | Business logic + DB transactions               | Know about HTTP or request objects |
| DTO                  | Typed input carrier from controller to service | Contain logic                      |
| Resource             | Serialize Eloquent model to JSON               | Compute business logic             |
| Model                | Eloquent relations, casts, scopes              | Call services                      |

---

## 4. Routing Conventions

### `routes/admin.php` — Inertia page routes (GET only)

```php
Route::middleware(['auth', 'verified', 'role:account_owner|team_member', 'subscription.active'])->group(function () {
    Route::group(['prefix' => 'admin', 'as' => 'admin.'], function () {
        Route::resource('projects', ProjectController::class)->only(['index', 'create', 'edit']);
    });
});
```

### `routes/api.php` — JSON mutation routes (POST/PUT/DELETE)

```php
Route::middleware(['auth:sanctum', 'throttle:120,1', 'role:account_owner|team_member', 'subscription.active'])->group(function () {
    Route::prefix('admin')->group(function () {
        Route::post('projects', [ProjectApiController::class, 'store']);
        Route::post('projects/{project}', [ProjectApiController::class, 'update']); // POST not PUT — file upload compat
        Route::delete('projects/{project}', [ProjectApiController::class, 'destroy']);
    });
});
```

### Named route pattern

`admin.{resource}.{action}` — e.g. `admin.projects.index`, `admin.projects.create`.

### Three groups sit outside the subscription gate, deliberately

| Routes | Why |
| --- | --- |
| `admin.billing-portal`, `admin.subscription.status` | A tenant whose subscription lapsed must still be able to reach the page that lets them pay |
| `routes/settings.php` (profile, password, appearance) | A locked user can still change their password or delete their account |
| `subscription.checkout`, `subscription.inactive` | The reactivation flow itself |

Everything else under `/admin` is gated. If you add a route that reads or writes tenant
data, it belongs in the gated group.

---

## 5. Backend Patterns — Quick Reference

### Controller (Inertia — page render)

```php
// app/Http/Controllers/Admin/ProjectController.php
public function index(Request $request): Response
{
    // The global scope already filters by tenant.
    $projects = Project::query()
        ->search($request->string('search')->toString(), ['name'])
        ->orderBy('name')
        ->paginate($request->integer('per_page', 25));

    return Inertia::render('admin/projects/index', [
        'projects' => ProjectResource::collection($projects)->additional([
            'total_count' => $projects->total(),
        ]),
    ]);
}
```

### Controller (API — JSON mutation)

```php
// app/Http/Controllers/API/Admin/ProjectApiController.php
public function store(Request $request): JsonResponse
{
    $validated = $request->validate([
        'name'  => ['required', 'string', 'max:255'],
        'notes' => ['nullable', 'string'],
    ]);

    $project = $this->projectService->create(
        CreateProjectData::fromValidated($validated),
        $request->user()->tenant_id, // ← always pass tenant context explicitly
    );

    return $this->successResponse(new ProjectResource($project), __('Project created'), 201);
}
```

### Service

```php
// app/Services/ProjectService.php
public function create(CreateProjectData $data, int $tenantId): Project
{
    try {
        DB::beginTransaction();

        $project = Project::create([
            'tenant_id' => $tenantId,
            'name'      => $data->name,
            'notes'     => $data->notes,
        ]);

        DB::commit();

        return $project->fresh();
    } catch (\Throwable $e) {
        DB::rollBack();
        Log::error($e);
        throw $e; // always re-throw — never swallow
    }
}
```

### DTO (Create)

```php
// app/DTOs/Projects/CreateProjectData.php
readonly class CreateProjectData
{
    public function __construct(
        public string $name,
        public ?string $notes = null,
    ) {}

    public static function fromValidated(array $validated): self
    {
        return new self(
            name:  $validated['name'],
            notes: $validated['notes'] ?? null,
        );
    }
}
```

### DTO (Update — with `isProvided`)

Update DTOs must distinguish "not sent" from "sent as null", or a PATCH that omits a
field would wipe it.

```php
readonly class UpdateProjectData
{
    public function __construct(
        public ?string $name = null,
        public ?string $notes = null,
        private array $provided = [],
    ) {}

    public function isProvided(string $field): bool
    {
        return in_array($field, $this->provided, true);
    }

    public static function fromValidated(array $validated): self
    {
        return new self(
            name:     $validated['name'] ?? null,
            notes:    $validated['notes'] ?? null,
            provided: array_keys($validated),
        );
    }
}
```

### Eloquent Resource

```php
/**
 * @mixin \App\Models\Project
 */
class ProjectResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'notes'      => $this->notes,
            'created_at' => $this->created_at,
            'tasks'      => $this->when(
                $this->relationLoaded('tasks'),
                fn () => TaskResource::collection($this->tasks)
            ),
        ];
    }
}
```

Wrapping is disabled globally in `AppServiceProvider` (`JsonResource::withoutWrapping()`),
so do **not** add `public static $wrap` to individual resources.

The `@mixin` line is required: `JsonResource` proxies unknown property reads to the
wrapped model, and static analysis cannot follow that without it.

### API response shape

```json
// Success
{ "ok": true, "message": "Project created", "data": { "id": 1, "name": "..." } }

// Error
{ "ok": false, "message": "The name field is required.", "errors": { "name": ["..."] } }
```

### Exception handling

```php
// Domain error the user can act on → KnownException
throw new KnownException(__('This project is already archived.'), 422);

// Unexpected error → log and re-throw, never swallow
} catch (\Throwable $e) {
    DB::rollBack();
    Log::error($e);
    throw $e;
}
```

---

## 6. Frontend Patterns — Quick Reference

### Breadcrumbs

Every page passes `breadcrumbs` to `AppLayout`. Always use the Ziggy `route()` helper —
never hardcode hrefs.

```tsx
<AppLayout
    {...props}
    breadcrumbs={[
        { title: t('Dashboard'), href: route('admin.index') },
        { title: t('Projects'), href: route('admin.projects.index') },
        { title: project.name, href: route('admin.projects.edit', project.id) },
    ]}
>
```

**Rules:**

- The first crumb is always the section dashboard (`admin.index` or `super-admin.index`).
- The last crumb is the current page.
- Never use back-arrow buttons — breadcrumbs replace that navigation.
- Never hardcode `/admin` or `/super-admin` paths.

### Index page

```tsx
// resources/js/pages/admin/projects/index.tsx
interface Props extends SharedData {
    projects: PaginatedData<ProjectResource>;
}

export default function AdminProjectsPage({ projects, ...props }: Props) {
    const { t } = useTranslation();

    return (
        <AppLayout
            {...props}
            breadcrumbs={[
                { title: t('Dashboard'), href: route('admin.index') },
                { title: t('Projects'), href: route('admin.projects.index') },
            ]}
        >
            <Head title={t('Projects')} />
            <div className="flex flex-1 flex-col gap-5 p-4">
                <section className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">{t('Projects')}</h1>
                    <Button asChild>
                        <Link href={route('admin.projects.create')}>{t('New project')}</Link>
                    </Button>
                </section>
                <section>
                    <ProjectsDataTable {...projects} />
                </section>
            </div>
        </AppLayout>
    );
}
```

### Form component

A form owns its own submission state. Never accept `onSubmit` or `isSubmitting` as props.

```tsx
export function ProjectForm({ defaultValues }: { defaultValues?: Partial<ProjectFormData> & { id?: number } }) {
    const { t } = useTranslation();
    const isEdit = !!defaultValues?.id;
    const form = useForm<ProjectFormData>({
        resolver: zodResolver(projectSchema),
        defaultValues: { name: '', ...defaultValues },
    });

    const onSubmit = async (data: ProjectFormData) => {
        try {
            if (isEdit) {
                await api.projects.update(defaultValues!.id!, data);
                toast.success(t('Project updated'));
            } else {
                await api.projects.create(data);
                toast.success(t('Project created'));
            }
            router.visit(route('admin.projects.index'));
        } catch (error) {
            handleApiError(error, form);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* fields */}
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? t('Saving…') : isEdit ? t('Update') : t('Create')}
                </Button>
            </form>
        </Form>
    );
}
```

### API client namespace

Components never call `axios` directly — everything goes through `api.{domain}.{method}()`.

```typescript
// resources/js/lib/api/api.ts
const projects = {
    create: async (data: CreateProjectInput) => (await apiClient.post<ApiResponse<ProjectResource>>('/admin/projects', data)).data,

    update: async (id: number, data: UpdateProjectInput) => (await apiClient.post<ApiResponse<ProjectResource>>(`/admin/projects/${id}`, data)).data,

    delete: async (id: number) => (await apiClient.delete<ApiResponse<null>>(`/admin/projects/${id}`)).data,
};

export const api = { users, roles, team, projects };
```

### Delete dialog

```tsx
export function DeleteProjectDialog({ project, onClose }: { project: ProjectResource; onClose: () => void }) {
    const { t } = useTranslation();
    const { deleteAsync, isDeleting } = useApiDelete();

    const handleDelete = async () => {
        const result = await deleteAsync(api.projects.delete(project.id));
        if (result !== undefined) {
            toast.success(t('Project deleted'));
            onClose();
            router.reload();
        }
    };

    return (
        <AlertDialog defaultOpen onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('Delete ":name"?', { name: project.name })}</AlertDialogTitle>
                    <AlertDialogDescription>{t('This action cannot be undone.')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>{t('Cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? t('Deleting…') : t('Delete')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
```

---

## 7. SaaS & Tenancy Rules

These rules are absolute. Every query against tenant-owned data must comply.

### The tenancy contract

- Every tenant-owned model has a `tenant_id` column and the `HasTenantScope` trait.
- **`tenant_id` always comes from `$request->user()->tenant_id`.** Never from the request body.

```php
// ✅ correct — the global scope handles it
Project::all();

// ✅ correct — explicit, for code that runs without an authenticated user
Project::where('tenant_id', $tenantId)->get();

// ❌ wrong — trusts user input
Project::where('tenant_id', $request->input('tenant_id'))->get();
```

### How isolation is enforced, and where it stops

Isolation comes from a global Eloquent scope (`App\Models\Scopes\TenantScope`) applied via
the `HasTenantScope` trait. Three consequences you must keep in mind:

1. **The scope is OFF when there is no authenticated user.** `TenantScope` no-ops whenever
   `auth()->hasUser()` is false — queue jobs, scheduled commands, Stripe webhook handlers,
   seeders. Code in those contexts must pass `tenant_id` explicitly and filter on it.
   `tests/Feature/Tenancy/TenantScopeTest.php` pins this behaviour; keep it green.

2. **The scope is OFF for super admins,** whose `tenant_id` is null. That is what lets the
   platform console see every tenant. It also means any query a super admin runs is
   unfiltered — be deliberate about it.

3. **Child tables without their own `tenant_id` are safe only by discipline.** If you add a
   table that hangs off a tenant-owned parent (line items, attachments) and choose not to
   give it a `tenant_id`, then:
   - **Never** query it directly by id. Always reach it through the scoped parent.
   - When validating a client-supplied id for one, prove ownership with an explicit query
     that joins to the scoped parent. Do **not** use `Rule::exists(...)->where(Closure)`:
     the closure is silently dropped when the rule is stringified, so it does not enforce
     the tenant filter.

   The simpler path is to give every table a `tenant_id` and the trait.

### Authorization & writes

- Resource ownership on bound routes is enforced two ways: the global scope makes
  route-model binding 404 a foreign record, and controllers additionally
  `abort_if($x->tenant_id !== $request->user()->tenant_id, 403)`. Keep both.
- Writes go through DTOs and services, never `Model::create($request->all())`.

### Users are reached through teams, not tenant queries

`User` carries `tenant_id` but deliberately does **not** use `HasTenantScope` — applying a
global scope to the auth model interferes with login, password reset and impersonation
lookups. The team screens reach members through `team_members`, never by querying users by
tenant. If you add a screen that lists users, scope it explicitly.

### Subscription gate middleware

`CheckActiveSubscription` is applied to all tenant routes. It allows the request when:

1. A super admin is impersonating (support needs in precisely when billing is broken), or
2. The tenant is not suspended **and** `$tenant->subscribed('default')` is true.

Otherwise it returns 402 for JSON, or redirects to `subscription.inactive`.

---

## 8. Stripe & Subscription Rules

### Integration points — these three, and no more

| Point                      | Purpose                                                                 |
| -------------------------- | ----------------------------------------------------------------------- |
| **Stripe Checkout**        | New tenant subscribes, enters card, trial starts                        |
| **Stripe Customer Portal** | Account owner self-manages billing (card, cancel, reactivate)           |
| **Stripe Webhooks**        | App listens for subscription changes and updates the local subscription |

Cashier's `Billable` trait is on **`Tenant`**, not `User` — a whole account shares one
subscription. This is wired in `AppServiceProvider` via `Cashier::useCustomerModel()`.

### Validity is decided by `ends_at`, not `stripe_status`

This trips people up. A subscription row with `stripe_status = 'canceled'` but a null or
future `ends_at` still counts as subscribed — that is the grace period the customer paid
for. Do not write access checks against `stripe_status`; use `$tenant->subscribed('default')`.

### Tenant access states

```
subscribed (active | trialing | cancelled-but-in-grace) → full access
anything else                                           → locked, reactivation screen
suspended by a super admin                              → locked regardless of Stripe
```

Do not build subscription tiers, per-plan feature flags, seat counts, or usage metering. If
you need them, add them deliberately — they are not free.

### Trial

- `SUBSCRIPTION_TRIAL_DAYS` (default 14), applied at Checkout.
- Card required up front. There is no card-free trial path.
- After the trial Stripe charges automatically; a failure fires a webhook and the tenant locks.

---

## 9. Internationalisation

Keys **are** the English source string, so a missing translation degrades to readable
English rather than to a dotted key.

- Backend: `__('Some string')`, dictionaries in `lang/{locale}.json`, plus the standard
  Laravel `lang/{locale}/{auth,passwords,validation,pagination}.php`.
- Frontend: `useTranslation()` inside components; the module-level `t()` from `@/lib/i18n`
  outside them (Zod schemas, the Axios interceptor) — those run at module load, before any
  hook could.
- The active dictionary is shared with Inertia by `HandleInertiaRequests`.

Whenever you add a string, add it to **both** `lang/en.json` and `lang/es.json`. They must
stay key-for-key identical.

---

## 10. Validation Conventions

**Default to inline `$request->validate()`** so the contract is visible at the call site.

```php
public function store(Request $request): JsonResponse
{
    $validated = $request->validate([
        'name'      => ['required', 'string', 'max:255'],
        'is_active' => ['boolean'],
    ]);
}
```

**Form Request classes are permitted** where they earn their keep — when validation carries
`authorize()` logic, is reused across endpoints, or includes auth/throttle helpers (see
`Auth\LoginRequest`, `Role\StoreRoleRequest`).

- Validation rules and the Zod schema must match. Add a backend rule, update the schema.
- Backed enums: `Rule::enum(StatusEnum::class)`.
- Tenant-scoped uniqueness:
  `Rule::unique('projects', 'name')->where('tenant_id', $request->user()->tenant_id)`.

---

## 11. TypeScript Conventions

- Page `Props` always use `EntityResource`, never the raw `Entity`.
- Form `defaultValues` types: `Partial<EntityFormData> & { id?: number }`.
- Both `Entity` and `EntityResource` live in `features/{domain}/interfaces/index.ts`.
- Never read `usePage().props.auth.user` directly — use `useAuth()`.
- Never read `window.location.search` directly — use `usePageUrl()`.
- `route()` returns a branded `RouteUrl`. It is assignable to `string`, but to compare one
  against a plain string, widen it: `String(route('admin.index'))`.

---

## 12. Custom Hooks

### `usePageUrl` — URL query params

```typescript
const { getParam, setParams, clearParams } = usePageUrl();
const search = getParam('search'); // string | null
setParams({ search: 'hello', per_page: 25 }); // triggers an Inertia GET
setParams({ search: null }); // removes the param
```

### `useAuth` — current user

```typescript
const { user, isAuthenticated, isSuperAdmin, isAccountOwner, teamRole, isTeamOwner, tenant } = useAuth();
```

### `useApiDelete` — deletion state

```typescript
const { deleteAsync, isDeleting } = useApiDelete();
const result = await deleteAsync(api.projects.delete(project.id));
if (result !== undefined) {
    toast.success(t('Deleted'));
    router.reload();
}
```

### `useTranslation` — i18n

```typescript
const { t, locale } = useTranslation();
t('Welcome back, :name.', { name: user.name });
```

---

## 13. Adding a New Module — Checklist

Use this every time you add a tenant-owned resource.

### Backend

- [ ] `app/Models/{Domain}.php` — `tenant_id`, `HasTenantScope`, `@property` docblock, typed relations
- [ ] Migration — `tenant_id` foreign key, `deleted_at` if soft-deletable
- [ ] `app/DTOs/{Domain}/Create{Domain}Data.php`
- [ ] `app/DTOs/{Domain}/Update{Domain}Data.php` (with `isProvided`)
- [ ] `app/Http/Resources/{Domain}Resource.php` (`@mixin`, `relationLoaded` guards)
- [ ] `app/Services/{Domain}Service.php` (DB transaction in every mutating method)
- [ ] `app/Http/Controllers/Admin/{Domain}Controller.php` (index, create, edit — Inertia only)
- [ ] `app/Http/Controllers/API/Admin/{Domain}ApiController.php` (store, update, destroy)
- [ ] Routes in `routes/admin.php` and `routes/api.php`
- [ ] Factory, and a feature test proving another tenant cannot reach it

### Frontend

- [ ] `resources/js/features/{domain}/interfaces/index.ts` — `Entity` + `EntityResource`
- [ ] `resources/js/features/{domain}/schemas/{domain}-form-schema.ts` — Zod schema + inferred type
- [ ] `resources/js/features/{domain}/components/{domain}-data-table/`
- [ ] `resources/js/features/{domain}/components/{domain}-form.tsx`
- [ ] `resources/js/features/{domain}/components/delete-{domain}-dialog.tsx`
- [ ] `api.{domain}` namespace in `resources/js/lib/api/api.ts`
- [ ] `resources/js/pages/admin/{domain}/{index,create,edit}.tsx` — with breadcrumbs
- [ ] Nav entry in `resources/js/lib/routes.ts`
- [ ] New strings added to **both** `lang/en.json` and `lang/es.json`

### Sanity checks

- [ ] Model uses `HasTenantScope`; a cross-tenant test proves isolation
- [ ] `tenant_id` sourced from `$request->user()->tenant_id`, never the request body
- [ ] `total_count` passed via `->additional()`, not inside `toArray()`
- [ ] Resource guards every relation with `$this->when($this->relationLoaded(...))`
- [ ] Service returns a refreshed model (`->fresh()` or `->load()`)
- [ ] Form uses `handleApiError(error, form)` in its catch block
- [ ] Zod schema and Laravel rules agree
- [ ] `php artisan test`, `pint`, `phpstan`, `npm run types`, `npm run lint` all pass

---

## 14. Hard Rules — Never Violate

### Tenancy

- ❌ Never accept `tenant_id` from the request body
- ❌ Never let account owner routes and super admin routes share a middleware group
- ❌ Never assume the global scope protects a query that runs without an authenticated user

### Billing

- ❌ Never put billing routes behind `subscription.active` — a lapsed tenant could never pay
- ❌ Never gate access on `stripe_status` directly; use `$tenant->subscribed('default')`

### Error handling

- ❌ Never swallow exceptions (`catch` without re-throwing)
- ❌ Never return `$e->getMessage()` from a generic `\Exception` — that leaks internals
- ✅ Domain errors the user can act on → `throw new KnownException(__('…'), 4xx)`
- ✅ Unexpected errors → log + re-throw → the global handler returns a generic 500

### Forms & validation

- ❌ Never accept `onSubmit` or `isSubmitting` as props on a form component
- ❌ Never call `axios.post()` directly in a component — use `api.{domain}.{method}()`

### Resources

- ❌ Never add `public static $wrap` — wrapping is disabled globally
- ❌ Never include a relation unconditionally — guard with `relationLoaded`
- ❌ Never put `total_count` inside `toArray()` — inject it via `->additional()`

### i18n

- ❌ Never hardcode a user-facing string — route it through `t()` / `__()`
- ❌ Never add a key to one dictionary and not the other

---

## 15. Starting a New Project From This Template

1. **Rename.** `composer.json` name, `APP_NAME` in `.env`, and the container names in the
   compose files.

2. **Configure.** `cp .env.example .env && php artisan key:generate`. The database
   credentials already match `docker-compose.dev.yml`.

3. **Boot.** `docker compose -f docker-compose.dev.yml up`, then
   `php artisan migrate --seed`. You get `superadmin@example.com` and
   `owner@example.com`, both with password `password`.

4. **Set up Stripe.** Create one recurring price in the Stripe dashboard and put its id in
   `STRIPE_PRICE_ID`. Add `STRIPE_KEY`, `STRIPE_SECRET_KEY`, and — from `stripe listen` —
   `STRIPE_WEBHOOK_SECRET`. Until you do, every tenant stays locked; that is the gate
   working, not a bug.

5. **Make it yours.** Replace the copy in `resources/js/pages/welcome.tsx`, delete
   `resources/js/components/beta-banner.tsx` and the `beta_mode` config if you do not want
   the notice, and fill in `CONTEXT.md` with your product's decisions.

6. **Build your first module** using the §13 checklist. Delete nothing else — what remains
   is the SaaS layer you came here for.

### Things you may want to add, deliberately

Subscription tiers, per-plan feature flags, usage metering, seat limits, per-tenant
subdomains, S3 uploads, PDF export, a CI pipeline. None are here, because each one is a
real decision rather than a default.
