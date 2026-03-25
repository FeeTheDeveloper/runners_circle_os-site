import Link from "next/link";

import type { DataSource } from "@/lib/db";
import type { ContentFilters, ContentListItem, ContentSummary } from "@/lib/db/content";

import { ContentCreateForm } from "@/components/content/content-create-form";
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
import { contentPlatformOptions, contentStatusOptions } from "@/lib/utils/domain-options";
import { formatDateTime, formatTokenLabel } from "@/lib/utils/format";

type ContentWorkspaceProps = {
  campaigns: Array<{
    id: string;
    name: string;
  }>;
  filters: ContentFilters;
  items: ContentListItem[];
  source: DataSource;
  summary: ContentSummary;
};

export function ContentWorkspace({ campaigns, filters, items, source, summary }: ContentWorkspaceProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard description="Content records currently tracked." label="Total" value={String(summary.total)} />
        <StatCard description="Approved or scheduled items waiting to go live." label="Queued / scheduled" tone="info" value={String(summary.scheduled)} />
        <StatCard description="Items still waiting for review." label="In review" tone="warning" value={String(summary.inReview)} />
        <StatCard description="Items already published." label="Published" tone="success" value={String(summary.published)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.92fr,1.08fr]">
        <ContentCreateForm campaigns={campaigns} />

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Publishing queue</CardTitle>
                <CardDescription>
                  Review scheduled assets, approval state, and campaign alignment from the server-rendered queue.
                </CardDescription>
              </div>
              <DataSourceBadge source={source} />
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <form className="grid gap-3 lg:grid-cols-[1.1fr,0.8fr,0.8fr,auto,auto]" method="get">
              <Input defaultValue={filters.query} name="q" placeholder="Search title, copy, format, or campaign" />
              <Select defaultValue={filters.platform} name="platform">
                <option value="ALL">All platforms</option>
                {contentPlatformOptions.map((platform) => (
                  <option key={platform} value={platform}>
                    {formatTokenLabel(platform)}
                  </option>
                ))}
              </Select>
              <Select defaultValue={filters.status} name="status">
                <option value="ALL">All statuses</option>
                {contentStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {formatTokenLabel(status)}
                  </option>
                ))}
              </Select>
              <Button type="submit" variant="secondary">
                Apply filters
              </Button>
              <Link className={buttonStyles({ variant: "ghost" })} href="/content">
                Reset
              </Link>
            </form>

            {items.length > 0 ? (
              <TableWrapper>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Content item</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Scheduled for</TableHead>
                      <TableHead>Campaign</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-white">{item.title}</p>
                            <p className="text-sm text-slate-300">{item.format}</p>
                            <p className="max-w-lg text-sm leading-6 text-slate-400">{item.copy}</p>
                          </div>
                        </TableCell>
                        <TableCell>{formatTokenLabel(item.platform)}</TableCell>
                        <TableCell>
                          <StatusBadge status={item.status} />
                        </TableCell>
                        <TableCell>{formatDateTime(item.scheduledFor)}</TableCell>
                        <TableCell>{item.campaignName ?? "Unassigned"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableWrapper>
            ) : (
              <EmptyState
                description="No content items are stored yet. Create the first item to start building the publishing queue."
                title="No content items yet"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
