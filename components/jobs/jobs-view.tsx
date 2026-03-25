import Link from "next/link";

import type { DataSource } from "@/lib/db";
import type { JobFilters, JobListItem, JobSummary } from "@/lib/db/jobs";

import { buttonStyles, Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { EmptyState } from "@/components/ui/empty-state";
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
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          description="Jobs queued or awaiting worker pickup."
          label="Pending"
          tone="warning"
          value={String(summary.pending)}
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
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Execution ledger</CardTitle>
              <CardDescription>
                Queue-oriented job monitoring for scheduled publishing, CRM sync, reporting, and audience refresh work.
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
                  ? "No automation jobs have been created yet. This queue is ready for future AWS-backed execution through EventBridge scheduling, SQS workers, and downstream job runners."
                  : "No automation jobs matched the current filters. Clear the filters to return to the broader execution ledger."
              }
              title={
                summary.total === 0
                  ? "Job execution queue is ready for integration"
                  : "No jobs matched the current filters"
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
