export const dynamic = "force-dynamic";

import { getDashboardData } from "@/lib/db/dashboard";

import { OverviewPanel } from "@/components/dashboard/overview-panel";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { getUser } from "@/lib/auth/session";

export default async function DashboardPage() {
  const [data, user] = await Promise.all([getDashboardData(), getUser()]);

  return (
    <AppShell>
      <PageHeader
        description={`Operational overview for campaign velocity, content scheduling, lead flow, and automation readiness across the internal marketing stack.${user ? ` Signed in as ${user.email}.` : ""}`}
        eyebrow="Overview"
        title="Dashboard"
      />
      <OverviewPanel data={data} />
    </AppShell>
  );
}
