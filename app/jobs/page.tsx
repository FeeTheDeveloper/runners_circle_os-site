export const dynamic = "force-dynamic";

import { JobsView } from "@/components/jobs/jobs-view";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { listAutomationJobs } from "@/lib/db/jobs";
import { jobStatusOptions, jobTypeOptions } from "@/lib/utils/domain-options";
import { getSearchParamValue } from "@/lib/utils/search-params";

type JobsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = (await searchParams) ?? {};
  const status = getSearchParamValue(params.status);
  const type = getSearchParamValue(params.type);
  const filters = {
    status: jobStatusOptions.includes(status as (typeof jobStatusOptions)[number])
      ? (status as (typeof jobStatusOptions)[number])
      : ("ALL" as const),
    type: jobTypeOptions.includes(type as (typeof jobTypeOptions)[number])
      ? (type as (typeof jobTypeOptions)[number])
      : ("ALL" as const)
  };
  const result = await listAutomationJobs(filters);

  return (
    <AppShell>
      <PageHeader
        description="Monitor queue state, scheduled execution, and operational throughput for automation jobs that power the marketing stack."
        eyebrow="Automation"
        title="Jobs"
      />
      <JobsView
        filters={filters}
        items={result.data.items}
        source={result.source}
        summary={result.data.summary}
      />
    </AppShell>
  );
}
