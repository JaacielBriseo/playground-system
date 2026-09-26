# Architecture & Development Guide

---

## Table of Contents

1. [What This Template Is](#1-what-this-template-is)
2. [Development Commands](#2-development-commands)
3. [Architecture Overview](#3-architecture-overview)
4. [Routing Conventions](#4-routing-conventions)
5. [Backend Patterns — Quick Reference](#5-backend-patterns--quick-reference)
6. [Frontend Patterns — Quick Reference](#6-frontend-patterns--quick-reference)
7. [Internationalisation](#7-internationalisation)
8. [Validation Conventions](#8-validation-conventions)
9. [TypeScript Conventions](#9-typescript-conventions)
10. [Custom Hooks](#10-custom-hooks)
11. [Adding a New Module — Checklist](#11-adding-a-new-module--checklist)
12. [Hard Rules — Never Violate](#12-hard-rules--never-violate)
13. [Starting a New Project From This Template](#13-starting-a-new-project-from-this-template)

---

## 1. What This Template Is

An admin + public site starting point: roles and permissions, a super admin console,
and an activity log. It ships **no domain code** — you add that.

**What it is NOT:**

- Not multi-tenant — there is no account/tenant isolation layer
- Not a SaaS billing starter — there is no subscription or payment gate
- Not an offline-first app (no service workers, no local sync)

**Reference files:**

- Product decisions and domain language for *your* project → `CONTEXT.md`
- The two access surfaces and how they are separated → §3 and §4 below

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
| Frontend bridge  | Inertia.js v2                |
| Frontend         | React 19, TypeScript         |
| Styling          | Tailwind CSS v4               |
| UI primitives    | shadcn/ui + Radix UI         |
| Tables           | TanStack Table v8            |
| Forms            | react-hook-form + Zod        |
| HTTP client      | Axios                        |
| Build tool       | Vite 7                       |
| Route generation | Ziggy                        |
| Database         | MySQL 8.4 (SQLite for tests) |

### The two access surfaces

They never share a middleware group. That separation is the point — a signed-in
user without the `super_admin` role cannot fall into the admin panel by accident.

| Module          | Prefix         | Middleware                              |
| --------------- | -------------- | ---------------------------------------- |
| **Public**      | `/`            | `guest` or none                          |
| **Super Admin** | `/super-admin` | `auth, verified, role:super_admin`       |

### Request lifecycle

**Page load (GET → Inertia):**

```
Browser GET → super-admin.php routes → middleware → Inertia Controller → render(Page, props)
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
| -------------------- | ----------------------------------------------- | ----------------------------------- |
| Controller (Inertia) | Render pages with data                         | Contain business logic              |
| Controller (API)     | Validate input, call service, return response  | Contain business logic              |
| Service              | Business logic + DB transactions               | Know about HTTP or request objects  |
| DTO                  | Typed input carrier from controller to service | Contain logic                       |
| Resource             | Serialize Eloquent model to JSON               | Compute business logic              |
| Model                | Eloquent relations, casts, scopes              | Call services                       |

---

## 4. Routing Conventions

### `routes/super-admin.php` — Inertia page routes (GET only)

```php
Route::middleware(['auth', 'verified', 'role:super_admin'])->group(function () {
    Route::group(['prefix' => 'super-admin', 'as' => 'super-admin.'], function () {
        Route::resource('projects', ProjectController::class)->only(['index', 'create', 'edit']);
    });
});
```

### `routes/api.php` — JSON mutation routes (POST/PUT/DELETE)

```php
Route::middleware(['auth:sanctum', 'throttle:120,1', 'role:super_admin'])->group(function () {
    Route::prefix('super-admin')->group(function () {
        Route::post('projects', [ProjectApiController::class, 'store']);
        Route::post('projects/{project}', [ProjectApiController::class, 'update']); // POST not PUT — file upload compat
        Route::delete('projects/{project}', [ProjectApiController::class, 'destroy']);
    });
});
```

### Named route pattern

`super-admin.{resource}.{action}` — e.g. `super-admin.projects.index`, `super-admin.projects.create`.

### `routes/settings.php` sits alongside the panel

Personal account settings (profile, password, appearance) live under
`super-admin/settings/*`, gated the same way as the rest of the panel
(`role:super_admin`). They are a separate route file only because they are shared
UI, not because they need different access rules.

---

## 5. Backend Patterns — Quick Reference

### Controller (Inertia — page render)

```php
// app/Http/Controllers/SuperAdmin/ProjectController.php
public function index(Request $request): Response
{
    $projects = Project::query()
        ->search($request->string('search')->toString(), ['name'])
        ->orderBy('name')
        ->paginate($request->integer('per_page', 25));

    return Inertia::render('super-admin/projects/index', [
        'projects' => ProjectResource::collection($projects)->additional([
            'total_count' => $projects->total(),
        ]),
    ]);
}
```

### Controller (API — JSON mutation)

```php
// app/Http/Controllers/API/SuperAdmin/ProjectApiController.php
public function store(Request $request): JsonResponse
{
    $validated = $request->validate([
        'name'  => ['required', 'string', 'max:255'],
        'notes' => ['nullable', 'string'],
    ]);

    $project = $this->projectService->create(
        CreateProjectData::fromValidated($validated),
    );

    return $this->successResponse(new ProjectResource($project), __('Project created'), 201);
}
```

### Service

```php
// app/Services/ProjectService.php
public function create(CreateProjectData $data): Project
{
    try {
        DB::beginTransaction();

        $project = Project::create([
            'name'  => $data->name,
            'notes' => $data->notes,
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
        { title: t('Dashboard'), href: route('super-admin.index') },
        { title: t('Projects'), href: route('super-admin.projects.index') },
        { title: project.name, href: route('super-admin.projects.edit', project.id) },
    ]}
>
```

**Rules:**

- The first crumb is always `super-admin.index`.
- The last crumb is the current page.
- Never use back-arrow buttons — breadcrumbs replace that navigation.
- Never hardcode `/super-admin` paths.

### Index page

```tsx
// resources/js/pages/super-admin/projects/index.tsx
interface Props extends SharedData {
    projects: PaginatedData<ProjectResource>;
}

export default function SuperAdminProjectsPage({ projects, ...props }: Props) {
    const { t } = useTranslation();

    return (
        <AppLayout
            {...props}
            breadcrumbs={[
                { title: t('Dashboard'), href: route('super-admin.index') },
                { title: t('Projects'), href: route('super-admin.projects.index') },
            ]}
        >
            <Head title={t('Projects')} />
            <div className="flex flex-1 flex-col gap-5 p-4">
                <section className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">{t('Projects')}</h1>
                    <Button asChild>
                        <Link href={route('super-admin.projects.create')}>{t('New project')}</Link>
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

A form owns its own submission state. Never accept `onSubmit` or `isSubmitting` as
props.

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
            router.visit(route('super-admin.projects.index'));
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
    create: async (data: CreateProjectInput) => (await apiClient.post<ApiResponse<ProjectResource>>('/super-admin/projects', data)).data,

    update: async (id: number, data: UpdateProjectInput) => (await apiClient.post<ApiResponse<ProjectResource>>(`/super-admin/projects/${id}`, data)).data,

    delete: async (id: number) => (await apiClient.delete<ApiResponse<null>>(`/super-admin/projects/${id}`)).data,
};

export const api = { users, roles, projects };
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

## 7. Internationalisation

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

## 8. Validation Conventions

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
- Uniqueness: `Rule::unique('projects', 'name')`.

---

## 9. TypeScript Conventions

- Page `Props` always use `EntityResource`, never the raw `Entity`.
- Form `defaultValues` types: `Partial<EntityFormData> & { id?: number }`.
- Both `Entity` and `EntityResource` live in `features/{domain}/interfaces/index.ts`.
- Never read `usePage().props.auth.user` directly — use `useAuth()`.
- Never read `window.location.search` directly — use `usePageUrl()`.
- `route()` returns a branded `RouteUrl`. It is assignable to `string`, but to compare one
  against a plain string, widen it: `String(route('super-admin.index'))`.

---

## 10. Custom Hooks

### `usePageUrl` — URL query params

```typescript
const { getParam, setParams, clearParams } = usePageUrl();
const search = getParam('search'); // string | null
setParams({ search: 'hello', per_page: 25 }); // triggers an Inertia GET
setParams({ search: null }); // removes the param
```

### `useAuth` — current user

```typescript
const { user, isAuthenticated, isSuperAdmin } = useAuth();
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

## 11. Adding a New Module — Checklist

Use this every time you add a resource.

### Backend

- [ ] `app/Models/{Domain}.php` — `@property` docblock, typed relations
- [ ] Migration — `deleted_at` if soft-deletable
- [ ] `app/DTOs/{Domain}/Create{Domain}Data.php`
- [ ] `app/DTOs/{Domain}/Update{Domain}Data.php` (with `isProvided`)
- [ ] `app/Http/Resources/{Domain}Resource.php` (`@mixin`, `relationLoaded` guards)
- [ ] `app/Services/{Domain}Service.php` (DB transaction in every mutating method)
- [ ] `app/Http/Controllers/SuperAdmin/{Domain}Controller.php` (index, create, edit — Inertia only)
- [ ] `app/Http/Controllers/API/SuperAdmin/{Domain}ApiController.php` (store, update, destroy)
- [ ] Routes in `routes/super-admin.php` and `routes/api.php`
- [ ] Factory, and a feature test covering index/create/update/delete

### Frontend

- [ ] `resources/js/features/{domain}/interfaces/index.ts` — `Entity` + `EntityResource`
- [ ] `resources/js/features/{domain}/schemas/{domain}-form-schema.ts` — Zod schema + inferred type
- [ ] `resources/js/features/{domain}/components/{domain}-data-table/`
- [ ] `resources/js/features/{domain}/components/{domain}-form.tsx`
- [ ] `resources/js/features/{domain}/components/delete-{domain}-dialog.tsx`
- [ ] `api.{domain}` namespace in `resources/js/lib/api/api.ts`
- [ ] `resources/js/pages/super-admin/{domain}/{index,create,edit}.tsx` — with breadcrumbs
- [ ] Nav entry in `resources/js/lib/routes.ts`
- [ ] New strings added to **both** `lang/en.json` and `lang/es.json`

### Sanity checks

- [ ] `total_count` passed via `->additional()`, not inside `toArray()`
- [ ] Resource guards every relation with `$this->when($this->relationLoaded(...))`
- [ ] Service returns a refreshed model (`->fresh()` or `->load()`)
- [ ] Form uses `handleApiError(error, form)` in its catch block
- [ ] Zod schema and Laravel rules agree
- [ ] `php artisan test`, `pint`, `phpstan`, `npm run types`, `npm run lint` all pass

---

## 12. Hard Rules — Never Violate

### Access

- ❌ Never let public routes and super admin routes share a middleware group

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

## 13. Starting a New Project From This Template

1. **Rename.** `composer.json` name, `APP_NAME` in `.env`, and the container names in the
   compose files.

2. **Configure.** `cp .env.example .env && php artisan key:generate`. The database
   credentials already match `docker-compose.dev.yml`.

3. **Boot.** `docker compose -f docker-compose.dev.yml up`, then
   `php artisan migrate --seed`. You get `superadmin@example.com` (password
   `password`), plus a `user@example.com` demo account with no panel access.

4. **Make it yours.** Replace the copy in `resources/js/pages/welcome.tsx`, delete
   `resources/js/components/beta-banner.tsx` and the `beta_mode` config if you do not want
   the notice, and fill in `CONTEXT.md` with your product's decisions.

5. **Build your first module** using the §11 checklist. Delete nothing else — what remains
   is the base you came here for.

### Things you may want to add, deliberately

Multi-tenancy, subscriptions/billing, teams and invitations, per-tenant subdomains, S3
uploads, PDF export, a CI pipeline. None are here, because each one is a real decision
rather than a default.
