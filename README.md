# SaaS Template

A multi-tenant SaaS starting point: **Laravel 13 + Inertia 2 + React 19 + TypeScript**,
with tenant isolation, roles, Stripe subscriptions that actually gate access, team
invitations, and a super admin console.

It ships **no domain code**. You add that.

---

## What you get

| Area | What is already built |
| --- | --- |
| **Tenancy** | Single database, `tenant_id` column, global Eloquent scope. Add the trait to a model and it is isolated. |
| **Auth** | Register, login, email verification, password reset, confirm password — all wired to tenants. |
| **RBAC** | Spatie Permission with `super_admin`, `account_owner`, `team_member`, plus a role/permission editor. |
| **Billing** | Stripe Checkout, Customer Portal, webhooks. No subscription means no access, enforced in middleware. |
| **Teams** | Email invitations with expiry, accept flow, member removal. |
| **Super admin** | Platform metrics, tenant list with suspend/reactivate, time-limited impersonation with an audit trail, activity log. |
| **i18n** | Spanish and English, keyed on English source strings, shared across back and front end. |
| **Quality** | 57 tests, Pint, PHPStan level 5, ESLint, `tsc --noEmit` — all green. |

### The three access surfaces

They never share a middleware group, so the boundaries cannot blur.

| Module | Prefix | Who |
| --- | --- | --- |
| **Public** | `/` | Anyone — landing page, pricing, auth, invitation accept |
| **Admin** | `/admin` | A tenant's users, once subscribed |
| **Super Admin** | `/super-admin` | You, the platform operator |

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
- `owner@example.com` → `/admin`

The owner starts **unsubscribed**, so the first thing you see is the billing gate. That is
deliberate — it is the flow most worth exercising first.

### Stripe

```bash
# 1. Create one recurring price in the Stripe dashboard, then:
STRIPE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...

# 2. Forward webhooks and copy the signing secret into STRIPE_WEBHOOK_SECRET
stripe listen --forward-to http://localhost:8000/stripe/webhook
```

The app boots fine without these — the landing page degrades and every tenant stays
locked.

---

## Verify

```bash
php artisan test              # 57 tests, in-memory SQLite, no Docker needed
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

**Read before writing code:** `docs/ARCHITECTURE.md` — especially §7 (tenancy, and the
three places isolation stops) and §8 (why subscription validity keys off `ends_at`, not
`stripe_status`).

---

## Deliberately not included

Subscription tiers, per-plan feature flags, usage metering, seat limits, per-tenant
subdomains, S3 uploads, PDF export, CI config. Each is a real decision, not a default.
