import type { DashboardData } from "@/lib/db/dashboard";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { EmptyState } from "@/components/ui/empty-state";
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
import { formatDate, formatDateTime, formatTokenLabel } from "@/lib/utils/format";

type OverviewPanelProps = {
  data: DashboardData;
};

const systemSignals = [
  {
    label: "CRM webhook",
    status: "Healthy",
    detail: "Inbound webhook handler is ready for signature verification and ingestion logic."
  },
  {
    label: "Publishing actions",
    status: "Queued",
    detail: "Content create flows are live and ready to hand off into future job execution."
  },
  {
    label: "AWS job plane",
    status: "Pending",
    detail: "Queue execution and media infrastructure remain staged for the next integration step."
  }
];

export function OverviewPanel({ data }: OverviewPanelProps) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {data.metrics.map((item) => (
          <StatCard
            description={item.description}
            key={item.label}
            label={item.label}
            tone={item.tone}
            value={item.value}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr,0.75fr]">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Campaign watchlist</CardTitle>
                <CardDescription>
                  Recently created campaigns and their current end-date visibility.
                </CardDescription>
              </div>
              <DataSourceBadge source={data.source} />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {data.campaigns.length > 0 ? (
              <TableWrapper>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>End date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.campaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-white">{campaign.name}</p>
                            <p className="max-w-lg text-sm leading-6 text-slate-400">{campaign.objective}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={campaign.status} />
                        </TableCell>
                        <TableCell>{formatDate(campaign.endDate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableWrapper>
            ) : (
              <div className="p-5">
                <EmptyState
                  description="Create campaigns to start populating the command center and downstream content planning views."
                  title="No campaigns available yet"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System signals</CardTitle>
            <CardDescription>
              Core operational surfaces staged for auth, CRM, social, and infrastructure integration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemSignals.map((signal) => (
              <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4" key={signal.label}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-white">{signal.label}</h3>
                  <StatusBadge status={signal.status} />
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-400">{signal.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming automation window</CardTitle>
            <CardDescription>
              Execution queue placeholder for publishing, CRM sync, and audience refresh jobs.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {data.jobs.length > 0 ? (
              <TableWrapper>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Queue key</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Scheduled for</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.jobs.map((job) => (
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableWrapper>
            ) : (
              <div className="p-5">
                <EmptyState
                  description="Automation jobs will appear here once queue-backed execution is enabled."
                  title="No queued jobs available yet"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <EmptyState
          description="This panel is reserved for alerting, approvals, or incident workflows once auth, CRM sync, and AWS-backed job execution are connected."
          title="Exception queue is staged for the next phase"
        />
      </section>
    </div>
  );
}
