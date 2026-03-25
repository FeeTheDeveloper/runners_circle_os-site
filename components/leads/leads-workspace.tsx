import Link from "next/link";

import type { DataSource } from "@/lib/db";
import type { LeadFilters, LeadListItem, LeadSummary } from "@/lib/db/leads";

import { LeadCreateForm } from "@/components/leads/lead-create-form";
import { buttonStyles, Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
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
import { leadStatusOptions } from "@/lib/utils/domain-options";
import { formatDate, formatTokenLabel } from "@/lib/utils/format";

type LeadsWorkspaceProps = {
  filters: LeadFilters;
  items: LeadListItem[];
  segments: Array<{
    id: string;
    name: string;
  }>;
  source: DataSource;
  summary: LeadSummary;
};

export function LeadsWorkspace({ filters, items, segments, source, summary }: LeadsWorkspaceProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard description="Lead records currently tracked." label="Total" value={String(summary.total)} />
        <StatCard description="New leads waiting for first action." label="New" tone="warning" value={String(summary.newCount)} />
        <StatCard description="Leads ready for direct follow-up." label="Qualified" tone="success" value={String(summary.qualified)} />
        <StatCard description="Leads in active nurture workflows." label="Nurturing" tone="info" value={String(summary.nurturing)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.92fr,1.08fr]">
        <LeadCreateForm segments={segments} />

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Lead pipeline</CardTitle>
                <CardDescription>
                  Monitor inbound and outbound contacts with server-rendered filtering and segment context.
                </CardDescription>
              </div>
              <DataSourceBadge source={source} />
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <form className="grid gap-3 md:grid-cols-[1.2fr,0.8fr,auto,auto]" method="get">
              <Input defaultValue={filters.query} name="q" placeholder="Search name, email, company, or source" />
              <Select defaultValue={filters.status} name="status">
                <option value="ALL">All statuses</option>
                {leadStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {formatTokenLabel(status)}
                  </option>
                ))}
              </Select>
              <Button type="submit" variant="secondary">
                Apply filters
              </Button>
              <Link className={buttonStyles({ variant: "ghost" })} href="/leads">
                Reset
              </Link>
            </form>

            {items.length > 0 ? (
              <TableWrapper>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lead</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Segment</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-white">
                              {lead.firstName} {lead.lastName}
                            </p>
                            <p className="text-sm text-slate-400">
                              {lead.email}
                              {lead.company ? ` | ${lead.company}` : ""}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={lead.status} />
                        </TableCell>
                        <TableCell>{lead.source ?? "Unknown"}</TableCell>
                        <TableCell>{lead.segmentName ?? "Unassigned"}</TableCell>
                        <TableCell>{formatDate(lead.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableWrapper>
            ) : (
              <EmptyState
                description="No leads are stored yet. Create the first lead to begin tracking outreach and qualification."
                title="No leads yet"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
