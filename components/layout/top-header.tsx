"use client";

import { usePathname } from "next/navigation";

import type { SessionUser } from "@/lib/auth/session";

import { SignOutForm } from "@/components/auth/sign-out-form";
import { Badge } from "@/components/ui/badge";

const sectionLabels: Record<string, string> = {
  "/dashboard": "Command center",
  "/campaigns": "Campaign planning",
  "/content": "Publishing queue",
  "/audiences": "Audience intelligence",
  "/leads": "Lead operations",
  "/jobs": "Automation monitor",
  "/settings": "System settings",
  "/sign-in": "Access control",
  "/sign-up": "Access control"
};

type TopHeaderProps = {
  user: SessionUser | null;
};

export function TopHeader({ user }: TopHeaderProps) {
  const pathname = usePathname();
  const currentSection = sectionLabels[pathname] ?? "Internal workspace";

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800/70 bg-slate-950/65 px-6 py-4 backdrop-blur lg:px-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">
            Internal Navigation
          </p>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="text-xl font-semibold text-white">{currentSection}</h1>
            <Badge variant="neutral">Private</Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="success">Postgres Ready</Badge>
          <Badge variant="info">Server Actions</Badge>
          <Badge variant="success">Supabase Auth</Badge>
          {user ? (
            <>
              <Badge variant="neutral">{user.role}</Badge>
              <span className="text-sm text-slate-300">{user.name ?? user.email}</span>
              <SignOutForm />
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
