import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default function AgentsLoading() {
  return (
    <AppShell>
      <PageHeader
        description="Generate structured prompts for campaign strategy, content packs, video direction, and automation planning, then push them into the shared job system."
        eyebrow="Agent Command Center"
        title="Agents"
      />
      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="h-10 w-44 animate-pulse rounded-xl bg-slate-900/80" />
            <div className="h-56 animate-pulse rounded-2xl bg-slate-900/70" />
            <div className="h-10 animate-pulse rounded-xl bg-slate-900/70" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="h-10 w-40 animate-pulse rounded-xl bg-slate-900/80" />
            <div className="h-80 animate-pulse rounded-2xl bg-slate-900/70" />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
