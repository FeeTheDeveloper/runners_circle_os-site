export const dynamic = "force-dynamic";

import { AudiencesWorkspace } from "@/components/audiences/audiences-workspace";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { listAudienceSegments } from "@/lib/db/audiences";
import { getSearchParamValue } from "@/lib/utils/search-params";

type AudiencesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AudiencesPage({ searchParams }: AudiencesPageProps) {
  const params = (await searchParams) ?? {};
  const filters = {
    query: getSearchParamValue(params.q),
    marketLane: getSearchParamValue(params.marketLane)
  };
  const result = await listAudienceSegments(filters);

  return (
    <AppShell>
      <PageHeader
        description="Shape market lanes, tags, and segment definitions for downstream personalization, targeting, and lead handoff."
        eyebrow="Segmentation"
        title="Audiences"
      />
      <AudiencesWorkspace
        filters={filters}
        items={result.data.items}
        source={result.source}
        summary={result.data.summary}
      />
    </AppShell>
  );
}
