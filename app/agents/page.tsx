export const dynamic = "force-dynamic";

import { AgentCommandCenter } from "@/components/agents/agent-command-center";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { listCampaignOptions } from "@/lib/db/campaigns";
import { getAgentsWorkspaceData } from "@/lib/db/agents";

export default async function AgentsPage() {
  const [workspaceResult, campaigns] = await Promise.all([getAgentsWorkspaceData(), listCampaignOptions()]);

  return (
    <AppShell>
      <PageHeader
        description="Generate structured prompts for campaign strategy, content packs, video direction, and automation planning, then push them into the shared job system."
        eyebrow="Agent Command Center"
        title="Agents"
      />
      <AgentCommandCenter
        campaigns={campaigns}
        prompts={workspaceResult.data.prompts}
        source={workspaceResult.source}
        summary={workspaceResult.data.summary}
      />
    </AppShell>
  );
}
