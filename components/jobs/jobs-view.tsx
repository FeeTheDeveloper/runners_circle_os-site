import Link from "next/link";

import type { DataSource } from "@/lib/db";
import type { JobFilters, JobListItem, JobSummary } from "@/lib/db/jobs";

import { buttonStyles, Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { RunDispatcherButton } from "@/components/jobs/run-dispatcher-button";
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
          label="Running"
          tone="info"
          value={String(summary.running)}
        />
        <StatCard
          description="Successfully completed work units."
          label="Succeeded"
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
                  Queue-oriented job monitoring for scheduled publishing, CRM sync, reporting, and audience refresh work.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <DataSourceBadge source={source} />
                <RunDispatcherButton />
              </div>
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
                    {formatTokenLabel(status)}
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
                      <TableHead>Queue key</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Completed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-white">{formatTokenLabel(job.type)}</p>
                            <p className="font-mono text-xs text-slate-500">{job.id}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={job.status} />
                        </TableCell>
                        <TableCell>{formatDateTime(job.scheduledFor)}</TableCell>
                        <TableCell>{job.startedAt ? formatDateTime(job.startedAt) : "Not started"}</TableCell>
                        <TableCell>{job.completedAt ? formatDateTime(job.completedAt) : "Not completed"}</TableCell>
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
              Persistence and queue monitoring are live. Distributed job execution is the next operational milestone.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4">
              <p className="text-sm font-semibold text-white">Next AWS phase</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Wire EventBridge for scheduling, SQS for queue handoff, and Lambda workers for execution so queued
                records can move from ledger state into real background processing.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4">
              <p className="text-sm font-semibold text-slate-100">Current posture</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-400">
                <li>Prisma-backed automation jobs are queryable from the App Router UI.</li>
                <li>Status tracking is ready for queued, running, succeeded, failed, and cancelled work.</li>
                <li>No worker plane is dispatching jobs yet, so this page remains an operational control surface.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
