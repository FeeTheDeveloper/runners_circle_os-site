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
- `/api/health`
- `/api/webhooks/crm`

## Project Structure

```text
app/
  (auth)/sign-in/
  api/
  audiences/
  campaigns/
  content/
  dashboard/
  jobs/
  leads/
  settings/
actions/
components/
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

4. Create and apply the initial migration:

```bash
npx prisma migrate dev --name init
```

5. If you prefer a schema sync during local prototyping, you can also use:

```bash
npm.cmd run prisma:push
```

6. Start the local app:

```bash
npm.cmd run dev
```

## Auth and Security Notes

- `middleware.ts` is prepared for auth gating and redirects unauthenticated traffic to `/sign-in` when `AUTH_MIDDLEWARE_ENABLED=true`.
- The default scaffold keeps `AUTH_MIDDLEWARE_ENABLED=false` so the shell can be reviewed before real session issuance is connected.
- Internal mutations live in `actions/*.ts` and write through Prisma with zod validation and route revalidation.
- Auth is intentionally not implemented yet, but the structure is ready for session-aware ownership and gating.

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
- `lib/db/*.ts` contains query helpers for dashboard metrics and list-page data loading.

## Next Build Phase

- Add real auth and session ownership to writes and reads
- Add update and delete flows for each core domain object
- Wire CRM and social provider clients
- Add AWS EventBridge/SQS job execution for automation records
- Add richer reporting, search, and operational audit trails
