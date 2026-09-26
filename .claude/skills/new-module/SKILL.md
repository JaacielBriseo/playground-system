---
name: new-module
description: Scaffold a new module (model, migration, DTOs, service, resource, controllers, routes, React feature and pages) following this project's conventions. Use when the user asks to add a resource, entity, module or CRUD — e.g. "add projects", "create an invoices module", "scaffold a new resource".
---

# Adding a module

Builds one resource end to end, matching `docs/ARCHITECTURE.md`. Read §5 and §6 of
that file before starting — this skill is the checklist, not the explanation.

## Before you write anything

Ask, unless the answer is already obvious from the request:

1. **Singular and plural names?** (`Project` / `projects`) — these drive every path.
2. **Fields**, with types and which are nullable.
3. **Soft-deletable?** If the record is ever referenced by history, yes.

## Build order

Work backend-first; each step compiles against the previous one.

### 1. Model + migration

- `@property` docblock for every column, and generic return types on relations
  (`/** @return HasMany<Task, $this> */`) — PHPStan runs at level 5 with
  `checkModelProperties` and will fail without them
- `SoftDeletes` + `deleted_at` if soft-deletable

### 2. DTOs

`app/DTOs/{Plural}/Create{Singular}Data.php` and `Update{Singular}Data.php`.
The update DTO needs `isProvided()` — without it, a PATCH that omits a field wipes it.

### 3. Service

`app/Services/{Singular}Service.php`. Every mutating method opens a transaction, commits,
and on failure rolls back, logs, and **re-throws**. Never swallow.

### 4. Resource

`app/Http/Resources/{Singular}Resource.php` with `@mixin \App\Models\{Singular}`.
Guard every relation with `$this->when($this->relationLoaded('x'), ...)`.
Do **not** add `public static $wrap` — wrapping is off globally.

### 5. Controllers

- `SuperAdmin/{Singular}Controller` — Inertia renders only (index, create, edit)
- `API/SuperAdmin/{Singular}ApiController` — store, update, destroy, returning
  `$this->successResponse(...)`

Updates use POST, not PUT, so the same endpoint accepts multipart form data.

### 6. Routes

Pages in `routes/super-admin.php`, mutations in `routes/api.php`. Match the existing
`role:super_admin` middleware group; do not invent a new one.

### 7. Frontend

Under `resources/js/features/{plural}/`: `interfaces/index.ts` (both `Entity` and
`EntityResource`), `schemas/`, `components/` (data table, form, delete dialog). Pages in
`resources/js/pages/super-admin/{plural}/`. Add the `api.{plural}` namespace to
`resources/js/lib/api/api.ts` and a nav entry to `resources/js/lib/routes.ts`.

### 8. Strings

Every user-facing string goes through `t()`, and every new key goes into **both**
`lang/en.json` and `lang/es.json`. They must stay key-for-key identical.

### 9. Tests

At minimum, a feature test covering index/create/update/delete for the new resource.

## Finish

Run all five, and do not report done until they pass:

```bash
php artisan test
./vendor/bin/pint
./vendor/bin/phpstan analyse
npm run types
npm run lint
```

There is also `php artisan app:generate-controller-and-react-page {path} {name}` for the
controller/page pair, if you prefer to start from a stub.
