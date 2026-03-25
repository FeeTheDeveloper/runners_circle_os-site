export const dynamic = "force-dynamic";

import { CampaignsWorkspace } from "@/components/campaigns/campaigns-workspace";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { listCampaigns } from "@/lib/db/campaigns";
import { campaignStatusOptions } from "@/lib/utils/domain-options";
import { getSearchParamValue } from "@/lib/utils/search-params";

type CampaignsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CampaignsPage({ searchParams }: CampaignsPageProps) {
  const params = (await searchParams) ?? {};
  const status = getSearchParamValue(params.status);
  const filters = {
    query: getSearchParamValue(params.q),
    status: campaignStatusOptions.includes(status as (typeof campaignStatusOptions)[number])
      ? (status as (typeof campaignStatusOptions)[number])
      : ("ALL" as const)
  };
  const result = await listCampaigns(filters);

  return (
    <AppShell>
      <PageHeader
        description="Plan objectives, align channel execution, and track lifecycle state for each active or upcoming marketing motion."
        eyebrow="Execution"
        title="Campaigns"
      />
      <CampaignsWorkspace
        filters={filters}
        items={result.data.items}
        source={result.source}
        summary={result.data.summary}
      />
    </AppShell>
  );
}
