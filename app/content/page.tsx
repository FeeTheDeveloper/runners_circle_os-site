export const dynamic = "force-dynamic";

import { ContentWorkspace } from "@/components/content/content-workspace";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { listCampaignOptions } from "@/lib/db/campaigns";
import { listContentItems } from "@/lib/db/content";
import { contentPlatformOptions, contentStatusOptions } from "@/lib/utils/domain-options";
import { getSearchParamValue } from "@/lib/utils/search-params";

type ContentPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ContentPage({ searchParams }: ContentPageProps) {
  const params = (await searchParams) ?? {};
  const status = getSearchParamValue(params.status);
  const platform = getSearchParamValue(params.platform);
  const filters = {
    query: getSearchParamValue(params.q),
    status: contentStatusOptions.includes(status as (typeof contentStatusOptions)[number])
      ? (status as (typeof contentStatusOptions)[number])
      : ("ALL" as const),
    platform: contentPlatformOptions.includes(platform as (typeof contentPlatformOptions)[number])
      ? (platform as (typeof contentPlatformOptions)[number])
      : ("ALL" as const)
  };
  const [contentResult, campaignOptions] = await Promise.all([
    listContentItems(filters),
    listCampaignOptions()
  ]);

  return (
    <AppShell>
      <PageHeader
        description="Manage publishing workflows, review status, and future media operations across organic, paid, email, and lifecycle channels."
        eyebrow="Publishing"
        title="Content"
      />
      <ContentWorkspace
        campaigns={campaignOptions}
        filters={filters}
        items={contentResult.data.items}
        source={contentResult.source}
        summary={contentResult.data.summary}
      />
    </AppShell>
  );
}
