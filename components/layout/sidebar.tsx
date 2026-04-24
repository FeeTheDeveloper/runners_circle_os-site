"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

const navigation: Array<{ href: Route; label: string; detail: string }> = [
  { href: "/dashboard", label: "Dashboard", detail: "Overview" },
  { href: "/campaigns", label: "Campaigns", detail: "Planning" },
  { href: "/content", label: "Content", detail: "Publishing" },
  { href: "/agents", label: "Agents", detail: "Command Center" },
  { href: "/creator", label: "Creator", detail: "Generation" },
  { href: "/audiences", label: "Audiences", detail: "Segmentation" },
  { href: "/leads", label: "Leads", detail: "Pipeline" },
  { href: "/jobs", label: "Jobs", detail: "Automation" },
  { href: "/settings", label: "Settings", detail: "Infrastructure" }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-[292px] shrink-0 flex-col border-r border-slate-800/70 bg-slate-950/70 px-5 py-6 backdrop-blur xl:flex">
      <div className="space-y-4">
        <div className="space-y-2">
          <Badge variant="info">Internal Ops</Badge>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">
              Runners Circle
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Marketing OS</h2>
          </div>
        </div>
        <p className="text-sm leading-6 text-slate-400">
          Central workspace for campaign execution, audience orchestration, lead operations, and system jobs.
        </p>
      </div>

      <nav className="mt-8 flex-1 space-y-2">
        {navigation.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              className={cn(
                "group flex items-center justify-between rounded-2xl border px-4 py-3 transition",
                active
                  ? "border-sky-400/30 bg-sky-400/10 text-white shadow-panel"
                  : "border-transparent bg-transparent text-slate-300 hover:border-slate-800 hover:bg-slate-900/70 hover:text-white"
              )}
              href={item.href}
              key={item.href}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-full transition",
                    active ? "bg-sky-300 shadow-[0_0_0_4px_rgba(56,189,248,0.14)]" : "bg-slate-600"
                  )}
                />
                <div>
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="text-xs text-slate-500 group-hover:text-slate-400">{item.detail}</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                {item.label.slice(0, 3)}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Foundation Ready</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Auth, Prisma wiring, CRM sync, and social publishing are staged for the next build step.
            </p>
          </div>
          <Badge variant="warning">Phase 1</Badge>
        </div>
      </div>
    </aside>
  );
}
