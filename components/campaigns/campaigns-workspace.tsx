import Link from "next/link";

import type { DataSource } from "@/lib/db";
import type { CampaignFilters, CampaignListItem, CampaignSummary } from "@/lib/db/campaigns";

import { CampaignCreateForm } from "@/components/campaigns/campaign-create-form";
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
import { campaignStatusOptions } from "@/lib/utils/domain-options";
import { formatDate, formatTokenLabel } from "@/lib/utils/format";

type CampaignsWorkspaceProps = {
  filters: CampaignFilters;
  items: CampaignListItem[];
  source: DataSource;
  summary: CampaignSummary;
};

export function CampaignsWorkspace({ filters, items, source, summary }: CampaignsWorkspaceProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard description="Campaigns tracked across planning and execution." label="Total" value={String(summary.total)} />
        <StatCard description="Campaigns actively running right now." label="Active" tone="success" value={String(summary.active)} />
        <StatCard description="Planned campaigns waiting to launch." label="Planned" tone="warning" value={String(summary.planned)} />
        <StatCard description="Completed campaigns retained for reporting." label="Completed" tone="info" value={String(summary.completed)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.92fr,1.08fr]">
        <CampaignCreateForm />

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Campaign registry</CardTitle>
                <CardDescription>
                  Filter active planning work and review campaign timelines from the server-backed list view.
                </CardDescription>
              </div>
              <DataSourceBadge source={source} />
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <form className="grid gap-3 md:grid-cols-[1.2fr,0.8fr,auto,auto]" method="get">
              <Input defaultValue={filters.query} name="q" placeholder="Search campaign or objective" />
              <Select defaultValue={filters.status} name="status">
                <option value="ALL">All statuses</option>
                {campaignStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {formatTokenLabel(status)}
                  </option>
                ))}
              </Select>
              <Button type="submit" variant="secondary">
                Apply filters
              </Button>
              <Link className={buttonStyles({ variant: "ghost" })} href="/campaigns">
                Reset
              </Link>
            </form>

            {items.length > 0 ? (
              <TableWrapper>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Start</TableHead>
                      <TableHead>End</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-white">{campaign.name}</p>
                            <p className="max-w-lg text-sm leading-6 text-slate-400">{campaign.objective}</p>
                            {campaign.description ? (
                              <p className="max-w-lg text-xs leading-5 text-slate-500">{campaign.description}</p>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={campaign.status} />
                        </TableCell>
                        <TableCell>{formatDate(campaign.startDate)}</TableCell>
                        <TableCell>{formatDate(campaign.endDate)}</TableCell>
                        <TableCell>{formatDate(campaign.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableWrapper>
            ) : (
              <EmptyState
                description="No campaigns are stored yet. Create the first campaign to begin planning execution inside the operating system."
                title="No campaigns yet"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
