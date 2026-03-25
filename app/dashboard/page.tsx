export const dynamic = "force-dynamic";

import { getDashboardData } from "@/lib/db/dashboard";

import { OverviewPanel } from "@/components/dashboard/overview-panel";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <AppShell>
      <PageHeader
        description="Operational overview for campaign velocity, content scheduling, lead flow, and automation readiness across the internal marketing stack."
        eyebrow="Overview"
        title="Dashboard"
      />
      <OverviewPanel data={data} />
    </AppShell>
  );
}
