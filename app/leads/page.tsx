export const dynamic = "force-dynamic";

import { AppShell } from "@/components/layout/app-shell";
import { LeadsWorkspace } from "@/components/leads/leads-workspace";
import { PageHeader } from "@/components/ui/page-header";
import { listAudienceSegmentOptions } from "@/lib/db/audiences";
import { listLeads } from "@/lib/db/leads";
import { leadStatusOptions } from "@/lib/utils/domain-options";
import { getSearchParamValue } from "@/lib/utils/search-params";

type LeadsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const params = (await searchParams) ?? {};
  const status = getSearchParamValue(params.status);
  const filters = {
    query: getSearchParamValue(params.q),
    status: leadStatusOptions.includes(status as (typeof leadStatusOptions)[number])
      ? (status as (typeof leadStatusOptions)[number])
      : ("ALL" as const)
  };
  const [leadResult, segments] = await Promise.all([listLeads(filters), listAudienceSegmentOptions()]);

  return (
    <AppShell>
      <PageHeader
        description="Track inbound and outbound lead status, segment alignment, and handoff readiness for the internal growth pipeline."
        eyebrow="Pipeline"
        title="Leads"
      />
      <LeadsWorkspace
        filters={filters}
        items={leadResult.data.items}
        segments={segments}
        source={leadResult.source}
        summary={leadResult.data.summary}
      />
    </AppShell>
  );
}
