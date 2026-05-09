# Security notes for DogText

## Rotate before launch

The `.env` shipped in the original Abacus.AI source-code zip contained live credentials.
Anyone who ever had a copy of that zip has these. Treat them as compromised and rotate
before any public traffic:

- `DATABASE_URL` — Postgres password on `db003.hosteddb.reai.io`. Cycle the role password
  (or migrate to a fresh DB you own) and update the URL.
- `NEXTAUTH_SECRET` — generate a new one: `openssl rand -base64 32`. Rotating this
  invalidates all existing JWT sessions, so plan for a forced re-login.
- `ABACUSAI_API_KEY` — request a new key from Abacus and revoke the old one.

## Set before launch

- `ADMIN_EMAILS` is a comma-separated list (case-insensitive). The shipped value is the
  placeholder `john@doe.com`, which means no real admin exists. Set this to your own
  email so you can approve/reject celebration submissions at `/admin/celebrations`.

## What's already locked down

- `/api/generate-dog-messages` (the public homepage demo) is rate-limited per IP
  (5 calls/hour) and validates input via Zod. Without these, this endpoint is a
  trivial cost-bomb on the LLM provider.
- `/api/signup` is rate-limited per IP (5/hour) and enforces 8+ char passwords +
  email format.
- Celebration admin routes (`/api/celebrations/[id]/approve`, `/api/celebrations/pending`,
  and `DELETE /api/celebrations/[id]`) all share the same `isAdminEmail()` helper.

## Pending DB migration

Daily Bark adds a `daily_barks` table. Schema is in `prisma/schema.prisma`. To enable:

```
npx prisma db push
```

Until that runs, `/api/daily-bark/[dogId]` returns 503 and the dashboard cards show
"Daily Bark is not yet enabled on this database" with a Retry button. The rest of
the app works normally.

The route also requires a working `ABACUSAI_API_KEY` (see rotation note above).

## Known limits of the rate limiter

`lib/rate-limit.ts` is in-process. On Vercel serverless every cold start gets a fresh
counter, so the cap is per-instance, not per-IP-globally. For real abuse protection,
swap to Upstash Redis once we have measurable traffic.
