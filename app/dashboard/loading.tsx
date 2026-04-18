import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";

export default function DashboardLoading() {
  return (
    <AppShell>
      <PageHeader
        description="Loading the latest campaign, content, lead, and automation metrics for your workspace."
        eyebrow="Overview"
        title="Dashboard"
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              className="h-40 animate-pulse rounded-2xl border border-slate-800/70 bg-slate-900/60"
              key={index}
            />
          ))}
        </div>

        <div className="space-y-4">
          <div className="h-52 animate-pulse rounded-2xl border border-slate-800/70 bg-slate-900/60" />
          <div className="h-52 animate-pulse rounded-2xl border border-slate-800/70 bg-slate-900/60" />
        </div>
      </div>
    </AppShell>
  );
}
