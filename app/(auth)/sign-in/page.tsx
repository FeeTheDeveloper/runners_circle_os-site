import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonStyles, Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[0.95fr,1.05fr]">
        <section className="flex flex-col justify-between rounded-[28px] border border-slate-800/70 bg-slate-950/55 p-8 shadow-panel backdrop-blur">
          <div className="space-y-6">
            <Badge variant="info">Internal Access</Badge>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold text-white">Runners Circle Marketing OS</h1>
              <p className="max-w-xl text-base leading-7 text-slate-400">
                Secure internal workspace for campaign orchestration, publishing workflows, audience segmentation,
                lead operations, and automation jobs.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">App Router</p>
              <p className="mt-3 text-sm text-slate-200">Server-first routing foundation with internal shell patterns.</p>
            </div>
            <div className="rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Prisma</p>
              <p className="mt-3 text-sm text-slate-200">Schema staged for campaigns, content, leads, and jobs.</p>
            </div>
            <div className="rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">AWS Ready</p>
              <p className="mt-3 text-sm text-slate-200">Integration folders and env placeholders are already wired.</p>
            </div>
          </div>
        </section>

        <Card className="border-slate-800/80 bg-slate-950/80">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Authentication is intentionally deferred to the next implementation phase. The form is staged for SSO,
              MFA, or Cognito wiring through middleware and server actions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200" htmlFor="email">
                Work email
              </label>
              <input
                className="h-12 w-full rounded-xl border border-slate-800 bg-slate-900/70 px-4 text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-sky-400/50"
                id="email"
                placeholder="name@runnerscircle.com"
                type="email"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200" htmlFor="password">
                Password
              </label>
              <input
                className="h-12 w-full rounded-xl border border-slate-800 bg-slate-900/70 px-4 text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-sky-400/50"
                id="password"
                placeholder="Password or SSO token"
                type="password"
              />
            </div>

            <Button className="w-full" disabled size="lg">
              Authentication wiring lands next
            </Button>

            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100">
              <code className="font-mono text-amber-50">AUTH_MIDDLEWARE_ENABLED</code> defaults to{" "}
              <code className="font-mono text-amber-50">false</code> in the scaffold so the internal shell can be
              reviewed before real auth is connected.
            </div>

            <Link
              className={buttonStyles({ className: "w-full", variant: "secondary", size: "lg" })}
              href="/dashboard"
            >
              Open dashboard preview
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
