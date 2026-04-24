import Link from "next/link";

import type { DataSource } from "@/lib/db";
import type { JobFilters, JobListItem, JobSummary } from "@/lib/db/jobs";

import { buttonStyles, Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { JobExecutionForm } from "@/components/jobs/job-execution-form";
import { Select } from "@/components/ui/select";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableWrapper
} from "@/components/ui/table";
import { getJobDisplayStatus, isJobRunnable } from "@/lib/jobs/constants";
import { jobStatusOptions, jobTypeOptions } from "@/lib/utils/domain-options";
import { formatDateTime, formatTokenLabel } from "@/lib/utils/format";

type JobsViewProps = {
  filters: JobFilters;
  items: JobListItem[];
  source: DataSource;
  summary: JobSummary;
};

export function JobsView({ filters, items, source, summary }: JobsViewProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          description="Jobs queued and waiting for worker pickup."
          label="Queued"
          tone="warning"
          value={String(summary.queued)}
        />
        <StatCard
          description="Jobs currently executing against sync or publishing workloads."
          label="Processing"
          tone="info"
          value={String(summary.running)}
        />
        <StatCard
          description="Successfully completed work units."
          label="Completed"
          tone="success"
          value={String(summary.succeeded)}
        />
        <StatCard
          description="Jobs that reached a terminal failure state and need operator review."
          label="Failed"
          tone="danger"
          value={String(summary.failed)}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Execution ledger</CardTitle>
                <CardDescription>
                  Internal execution tracking for publishing, creator-generation, and agent-command jobs with safe lifecycle controls and retry support.
                </CardDescription>
              </div>
              <DataSourceBadge source={source} />
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <form className="grid gap-3 md:grid-cols-[1fr,1fr,auto,auto]" method="get">
              <Select defaultValue={filters.type} name="type">
                <option value="ALL">All job types</option>
                {jobTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {formatTokenLabel(type)}
                  </option>
                ))}
              </Select>
              <Select defaultValue={filters.status} name="status">
                <option value="ALL">All statuses</option>
                {jobStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {formatTokenLabel(getJobDisplayStatus(status))}
                  </option>
                ))}
              </Select>
              <Button type="submit" variant="secondary">
                Apply filters
              </Button>
              <Link className={buttonStyles({ variant: "ghost" })} href="/jobs">
                Reset
              </Link>
            </form>

            {items.length > 0 ? (
              <TableWrapper>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead>Content / Prompt</TableHead>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-white">{formatTokenLabel(job.type)}</p>
                            <p className="font-mono text-xs text-slate-500">{job.id}</p>
                            {job.resultSummary ? <p className="text-xs text-slate-400">{job.resultSummary}</p> : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <StatusBadge status={getJobDisplayStatus(job.status)} />
                            {job.errorMessage ? <p className="text-xs text-rose-300">{job.errorMessage}</p> : null}
                          </div>
                        </TableCell>
                        <TableCell>{formatDateTime(job.createdAt)}</TableCell>
                        <TableCell>{formatDateTime(job.updatedAt)}</TableCell>
                        <TableCell>
                          {job.contentTitle ? (
                            <div className="space-y-1">
                              <p className="text-sm text-slate-100">{job.contentTitle}</p>
                              {job.contentItemId ? (
                                <p className="font-mono text-xs text-slate-500">{job.contentItemId}</p>
                              ) : null}
                            </div>
                          ) : (
                            "Not attached"
                          )}
                        </TableCell>
                        <TableCell>
                          {job.campaignName ?? (job.campaignId ? "Attached campaign" : "Unassigned")}
                        </TableCell>
                        <TableCell>{formatDateTime(job.scheduledFor)}</TableCell>
                        <TableCell>
                          {isJobRunnable(job.status) ? (
                            <JobExecutionForm
                              jobId={job.id}
                              mode={job.status === "FAILED" ? "retry" : "run"}
                            />
                          ) : (
                            <span className="text-sm text-slate-500">
                              {job.status === "RUNNING"
                                ? "Processing"
                                : job.status === "SUCCEEDED"
                                  ? "Completed"
                                  : "No action"}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableWrapper>
            ) : (
              <EmptyState
                description={
                  summary.total === 0
                    ? "No automation jobs have been created yet. The execution ledger is ready as soon as queue persistence is exercised."
                    : "No automation jobs matched the current filters. Clear the filters to return to the broader execution ledger."
                }
                title={summary.total === 0 ? "No jobs have been recorded yet" : "No jobs matched the current filters"}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Execution engine status</CardTitle>
            <CardDescription>
              Execution is now fully internal for the first lifecycle pass, with manual controls for safe validation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4">
              <p className="text-sm font-semibold text-white">Current execution scope</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Content publish, creator generation, and agent-command jobs can now move from queued to processing to
                completed or failed entirely inside the app, without touching third-party publishing or generation
                providers.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4">
              <p className="text-sm font-semibold text-slate-100">Current posture</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-400">
                <li>Queued content publish jobs can be run manually from the App Router jobs surface.</li>
                <li>Creator generation jobs share the same queue, retry, and worker execution pipeline.</li>
                <li>Agent command jobs package structured prompts and move through the same completion and webhook flow.</li>
                <li>Failed jobs retain error details on the record and can be retried from the same table.</li>
                <li>Job completion stores a structured internal result without publishing to third-party channels.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
