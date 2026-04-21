export const dynamic = "force-dynamic";

import { CreatorWorkspace } from "@/components/creator/creator-workspace";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { listCampaignOptions } from "@/lib/db/campaigns";
import { getCreatorWorkspaceData } from "@/lib/db/creator";

export default async function CreatorPage() {
  const [workspaceResult, campaigns] = await Promise.all([getCreatorWorkspaceData(), listCampaignOptions()]);

  return (
    <AppShell>
      <PageHeader
        description="Create code-driven image and video requests, queue them into automation, and track generated outputs without leaving the core OS."
        eyebrow="Creator Engine"
        title="Creator"
      />
      <CreatorWorkspace
        assets={workspaceResult.data.assets}
        campaigns={campaigns}
        requests={workspaceResult.data.requests}
        source={workspaceResult.source}
        summary={workspaceResult.data.summary}
      />
    </AppShell>
  );
}
