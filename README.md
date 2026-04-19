# Runners Circle Marketing OS

Runners Circle Marketing OS is a production-minded internal operations app built with Next.js App Router, TypeScript, Tailwind CSS, Prisma, PostgreSQL, Zod, and Server Actions. The current foundation includes the first real CRUD-oriented data layer for campaigns, content, audiences, leads, and automation jobs.

## Stack

- Next.js App Router only
- TypeScript with strict mode enabled
- Tailwind CSS for reusable operational UI
- Prisma ORM with PostgreSQL datasource
- Server Actions for internal mutations
- Route Handlers reserved for public or external-facing endpoints

## Routes

- `/` redirects to `/dashboard`
- `/dashboard`
- `/campaigns`
- `/content`
- `/audiences`
- `/leads`
- `/jobs`
- `/settings`
- `/sign-in`
- `/sign-up`
- `/api/health`
- `/api/webhooks/crm`

## Project Structure

```text
app/
  (auth)/actions.ts
  api/
  audiences/
  campaigns/
  content/
  dashboard/
  jobs/
  leads/
  settings/
  sign-in/
  sign-up/
actions/
components/
  auth/
  audiences/
  campaigns/
  content/
  dashboard/
  jobs/
  layout/
  leads/
  ui/
lib/
  auth/
  aws/
  crm/
  db/
  jobs/
  social/
  utils/
  validators/
prisma/
  schema.prisma
```

## Local Setup

1. Install dependencies:

```bash
npm.cmd install
```

2. Copy environment variables:

```bash
Copy-Item .env.example .env
```

3. Generate the Prisma client:

```bash
npm.cmd run prisma:generate
```

4. Apply the committed Prisma migrations:

```bash
npm.cmd run prisma:migrate:dev
```

5. When you create a new migration locally after schema changes, use:

```bash
npm.cmd run prisma:migrate:dev -- --name your-change-name
```

6. If you prefer a schema sync during local prototyping, you can also use:

```bash
npm.cmd run prisma:push
```

7. Start the local app:

```bash
npm.cmd run dev
```

## Vercel Deployment

- `vercel.json` is configured to use `npm run deploy:vercel`, which runs a deployment script that always generates Prisma Client, applies committed migrations when `DATABASE_URL` is present, and then builds Next.js.
- If `DATABASE_URL` is not set, the deploy still succeeds and the app falls back to degraded database-unavailable mode.
- Set `DATABASE_URL` in Vercel for both the `Production` and `Preview` environments when you are ready to use the live database and automatic migrations.
- Use separate PostgreSQL databases for preview and production environments so preview deployments cannot apply migrations against production data.
- Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from your Supabase project before testing the protected dashboard.
- Add the rest of the secrets from `.env.example` only when you enable those integrations.
- After deploy, call `/api/health` to confirm the runtime environment and database reachability. The health response now includes `vercelEnv` and a `database` status object.

## Auth and Security Notes

- Supabase Auth is wired with App Router-safe SSR clients under `lib/supabase`.
- `middleware.ts` refreshes the Supabase session cookie and redirects unauthenticated users to `/sign-in`.
- `/sign-in`, `/sign-up`, `/api/health`, `/api/public/*`, and `/api/webhooks/*` remain publicly reachable.
- Internal mutations live in `actions/*.ts` and write through Prisma with zod validation and route revalidation.
- Authenticated writes now persist local user ownership for campaigns, content, audiences, and leads.

## Automation Queue Flow

- Automatic SQS enqueueing uses `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, and `AWS_SQS_QUEUE_URL`.
- Create an SQS queue in AWS, copy its queue URL into `AWS_SQS_QUEUE_URL`, and use IAM credentials that can send, receive, and delete messages on that queue.
- Creating content inserts a queued `AutomationJob` in Prisma first and then attempts to enqueue its `jobId` to SQS.
- If AWS queue env vars are missing, content creation still succeeds and the app logs that automatic queueing was skipped.
- Run the queue worker locally with `npm.cmd run sqs:worker`.
- Manual `Run now` and `Retry` controls remain available in `/jobs` as a fallback when automatic execution is unavailable or when a job needs operator intervention.

## Prisma Domain Coverage

The initial schema includes:

- `User`
- `Campaign`
- `ContentItem`
- `AudienceSegment`
- `Lead`
- `AutomationJob`
- `ChannelAccount`
- `IntegrationConnection`

These models are designed to support:

- Campaign planning and lifecycle tracking
- Cross-channel content scheduling and campaign linkage
- Audience segmentation and tagging
- Lead intake and status progression
- Automation job orchestration
- Social and CRM account connectivity
- Future AWS-backed media and job infrastructure

## Architecture Notes

- App Router is used exclusively. There is no Pages Router and no `pages/api`.
- Server Actions are used for app-owned create operations.
- Route Handlers are reserved for public infrastructure surfaces such as health checks and webhook intake.
- Shared UI components live under `components/ui`, while domain-specific surfaces live in `components/<domain>`.
- Integration-specific helpers are segmented into `lib/crm`, `lib/social`, `lib/jobs`, and `lib/aws` to keep future AWS and third-party wiring isolated.
- `lib/db/prisma.ts` and `lib/db/index.ts` provide the shared server-safe database entry point.
- `prisma/migrations/20260326010000_init` provides the baseline schema migration used by Vercel deploys and fresh local databases.
- `lib/db/*.ts` contains query helpers for dashboard metrics and list-page data loading.

## Next Build Phase

- Add per-user read filtering and Row Level Security strategy for multi-tenant isolation
- Add update and delete flows for each core domain object
- Wire CRM and social provider clients
- Add AWS EventBridge/SQS job execution for automation records
- Add richer reporting, search, and operational audit trails
