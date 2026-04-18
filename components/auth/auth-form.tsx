"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signIn, signUp } from "@/app/(auth)/actions";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialActionState } from "@/lib/utils/action-state";

type AuthMode = "sign-in" | "sign-up";

type AuthFormProps = {
  mode: AuthMode;
  redirectTo?: string;
  message?: string;
};

const authContent = {
  "sign-in": {
    title: "Sign in",
    description: "Use your Supabase-backed team credentials to access the private operating system.",
    submitLabel: "Continue to dashboard",
    pendingLabel: "Signing in...",
    alternateHref: "/sign-up",
    alternateLabel: "Create an account",
    alternatePrompt: "Need access?"
  },
  "sign-up": {
    title: "Create account",
    description: "Create an internal operator account backed by Supabase Auth and secure session cookies.",
    submitLabel: "Create account",
    pendingLabel: "Creating account...",
    alternateHref: "/sign-in",
    alternateLabel: "Back to sign in",
    alternatePrompt: "Already have an account?"
  }
} as const;

const heroCards = [
  {
    label: "App Router",
    detail: "Server-first routing with middleware-based access control."
  },
  {
    label: "Supabase SSR",
    detail: "Cookie-backed sessions that persist across refreshes."
  },
  {
    label: "Prisma",
    detail: "Existing database workflows stay intact for multi-user ownership."
  }
];

export function AuthForm({ mode, redirectTo, message }: AuthFormProps) {
  const copy = authContent[mode];
  const [state, formAction] = useActionState(mode === "sign-in" ? signIn : signUp, initialActionState);

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[0.95fr,1.05fr]">
        <section className="flex flex-col justify-between rounded-[28px] border border-slate-800/70 bg-slate-950/55 p-8 shadow-panel backdrop-blur">
          <div className="space-y-6">
            <Badge variant="info">Supabase Auth</Badge>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold text-white">Runners Circle Marketing OS</h1>
              <p className="max-w-xl text-base leading-7 text-slate-400">
                Secure internal workspace for campaign orchestration, publishing workflows, audience segmentation,
                lead operations, and automation jobs.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {heroCards.map((card) => (
              <div className="rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4" key={card.label}>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{card.label}</p>
                <p className="mt-3 text-sm text-slate-200">{card.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <Card className="border-slate-800/80 bg-slate-950/80">
          <CardHeader>
            <CardTitle>{copy.title}</CardTitle>
            <CardDescription>{copy.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {message ? (
              <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                {message}
              </div>
            ) : null}

            <form action={formAction} className="space-y-5">
              <input name="redirectTo" type="hidden" value={redirectTo ?? ""} />

              <FormField error={state.fieldErrors?.email?.[0]} htmlFor={`${mode}-email`} label="Work email">
                <Input
                  autoComplete="email"
                  id={`${mode}-email`}
                  name="email"
                  placeholder="name@runnerscircle.com"
                  required
                  type="email"
                />
              </FormField>

              <FormField error={state.fieldErrors?.password?.[0]} htmlFor={`${mode}-password`} label="Password">
                <Input
                  autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                  id={`${mode}-password`}
                  minLength={8}
                  name="password"
                  placeholder={mode === "sign-in" ? "Enter your password" : "Choose a secure password"}
                  required
                  type="password"
                />
              </FormField>

              <FormMessage state={state} />

              <SubmitButton className="w-full" pendingLabel={copy.pendingLabel} size="lg">
                {copy.submitLabel}
              </SubmitButton>
            </form>

            <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4 text-sm text-slate-300">
              <span className="font-medium text-slate-100">{copy.alternatePrompt}</span>{" "}
              <Link
                className={buttonStyles({
                  className: "mt-3 w-full",
                  size: "lg",
                  variant: "secondary"
                })}
                href={redirectTo ? `${copy.alternateHref}?redirectTo=${encodeURIComponent(redirectTo)}` : copy.alternateHref}
              >
                {copy.alternateLabel}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
