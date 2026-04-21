import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default function CreatorLoading() {
  return (
    <AppShell>
      <PageHeader
        description="Create code-driven image and video requests, queue them into automation, and track generated outputs without leaving the core OS."
        eyebrow="Creator Engine"
        title="Creator"
      />
      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="h-10 w-40 animate-pulse rounded-xl bg-slate-900/80" />
            <div className="h-48 animate-pulse rounded-2xl bg-slate-900/70" />
            <div className="h-10 animate-pulse rounded-xl bg-slate-900/70" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="h-10 w-48 animate-pulse rounded-xl bg-slate-900/80" />
            <div className="h-72 animate-pulse rounded-2xl bg-slate-900/70" />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
