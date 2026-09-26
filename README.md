# App Template

An admin + public site starting point: **Laravel 13 + Inertia 2 + React 19 + TypeScript**,
with roles and permissions, a super admin console, and an activity log.

It ships **no domain code**. You add that.

---

## What you get

| Area | What is already built |
| --- | --- |
| **Auth** | Login, email verification, password reset, confirm password. Accounts are created by an admin — there is no public self-registration. |
| **RBAC** | Spatie Permission with `super_admin`, plus a role/permission editor. A generic `user` role ships as scaffolding for authenticated visitors with no panel access. |
| **Super admin** | User management, role/permission editor, activity log. |
| **i18n** | Spanish and English, keyed on English source strings, shared across back and front end. |
| **Quality** | Pint, PHPStan level 5, ESLint, `tsc --noEmit` — all green. |

### The two access surfaces

| Module | Prefix | Who |
| --- | --- | --- |
| **Public** | `/` | Anyone — landing page, auth |
| **Super Admin** | `/super-admin` | You, the operator |

---

## Getting started

```bash
cp .env.example .env
composer install
npm install
php artisan key:generate

docker compose -f docker-compose.dev.yml up -d
php artisan migrate --seed
npm run dev
```

App at http://localhost:8000, mail at http://localhost:8025.

Seeded accounts (password `password` for both):

- `superadmin@example.com` → `/super-admin`
- `user@example.com` → no panel access, demonstrates the `user` role

---

## Verify

```bash
php artisan test               # in-memory SQLite, no Docker needed
./vendor/bin/pint --test
./vendor/bin/phpstan analyse
npm run types && npm run lint && npm run build
```

---

## Making it yours

1. Rename: `composer.json`, `APP_NAME`, container names in the compose files.
2. Rewrite the copy in `resources/js/pages/welcome.tsx`.
3. Fill in `CONTEXT.md` — what you are building and why.
4. Build your first module with the checklist in `docs/ARCHITECTURE.md` §13.

**Safe to delete if you do not want them:** `resources/js/components/beta-banner.tsx`
and the `beta_mode` config, `app/Models/File.php` with its migration and uploader
components, and the English or Spanish half of `lang/` if you only need one language.

**Read before writing code:** `docs/ARCHITECTURE.md`.
