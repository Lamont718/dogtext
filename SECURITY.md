# DogText — deploy & security notes

## Off-Abacus migration

DogText started as an Abacus.AI export. We've cut the cord:

- **LLM**: code now calls `https://api.openai.com/v1/chat/completions` directly with
  `OPENAI_API_KEY`. Model is `gpt-4o-mini` for chat, the public homepage demo, and
  Daily Bark generation. No Abacus dependency anywhere in the code.
- **Database**: still pointed at the Abacus-hosted Postgres in your local `.env`.
  Provision a fresh DB before deploy and update `DATABASE_URL`.
- **Storage**: AWS env vars in the original `.env` point at an Abacus-hosted S3
  bucket. Provision a fresh S3-compatible bucket (or leave AWS keys blank if you're
  not turning on celebration uploads in v1).

## Required env vars on Vercel

| Var | Where to get it | Notes |
|-----|-----------------|-------|
| `DATABASE_URL` | Neon / Supabase / Railway / RDS | Run `npx prisma db push` once against this DB to create all tables (including `daily_barks`). |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | Fresh value, never reuse the leaked-in-zip one. |
| `NEXTAUTH_URL` | Your Vercel deploy URL | Set after first deploy. e.g. `https://dogtext.vercel.app` or your custom domain. |
| `OPENAI_API_KEY` | platform.openai.com | Without it, `/api/chat`, `/api/generate-dog-messages`, and `/api/daily-bark/*` return 503. Rest of site works. |
| `ADMIN_EMAILS` | You | Comma-separated, case-insensitive. Set to `lamont1879@gmail.com` so you can use `/admin/celebrations`. |
| `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` + `AWS_REGION` + `AWS_BUCKET_NAME` + `AWS_FOLDER_PREFIX` | Cloudflare R2 / AWS S3 / Backblaze | Only needed for celebration photo uploads. Skip in v1 if launching without celebrations. |

## Pre-deploy checklist

1. Provision a fresh Postgres database.
2. `cp .env.example .env.local`, fill in the real values for local dev.
3. `npx prisma db push` to create the schema (including `daily_barks`).
4. `npm run build` locally — confirms `prisma generate` runs and the build is green.
5. Push to GitHub.
6. On Vercel: Import Project → connect the GitHub repo.
7. On Vercel: paste each env var into Project Settings → Environment Variables (set for Production + Preview).
8. Trigger first deploy. Update `NEXTAUTH_URL` to the live URL after, then redeploy.

## What's already locked down

- `/api/generate-dog-messages` (the public homepage demo) is rate-limited per IP
  (5 calls/hour) and validates input via Zod. Without these, this endpoint is a
  trivial cost-bomb on the LLM provider.
- `/api/signup` is rate-limited per IP (5/hour) and enforces 8+ char passwords +
  email format.
- Celebration admin routes (`/api/celebrations/[id]/approve`, `/api/celebrations/pending`,
  `DELETE /api/celebrations/[id]`) all share the same `isAdminEmail()` helper.
- `/api/daily-bark/[dogId]` is auth-required and idempotent per dog per day via a
  unique constraint, so spam-clicking can't burn through OpenAI credits.

## Known limits of the rate limiter

`lib/rate-limit.ts` is in-process. On Vercel serverless every cold start gets a fresh
counter, so the cap is per-instance, not per-IP-globally. For real abuse protection,
swap to Upstash Redis once we have measurable traffic.
