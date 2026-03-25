import Link from "next/link";

import type { DataSource } from "@/lib/db";
import type { AudienceFilters, AudienceListItem, AudienceSummary } from "@/lib/db/audiences";

import { AudienceCreateForm } from "@/components/audiences/audience-create-form";
import { buttonStyles, Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableWrapper
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils/format";

type AudiencesWorkspaceProps = {
  filters: AudienceFilters;
  items: AudienceListItem[];
  source: DataSource;
  summary: AudienceSummary;
};

export function AudiencesWorkspace({ filters, items, source, summary }: AudiencesWorkspaceProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard description="Audience segments currently defined." label="Total" value={String(summary.total)} />
        <StatCard description="Segments already connected to one or more leads." label="With leads" tone="success" value={String(summary.withLeads)} />
        <StatCard description="Segments carrying tag metadata for targeting." label="Tagged" tone="info" value={String(summary.tagged)} />
        <StatCard description="Distinct market lanes in active use." label="Market lanes" tone="warning" value={String(summary.marketLanes)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.92fr,1.08fr]">
        <AudienceCreateForm />

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Audience registry</CardTitle>
                <CardDescription>
                  Review segment definitions, market lanes, and downstream lead volume from the central list view.
                </CardDescription>
              </div>
              <DataSourceBadge source={source} />
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <form className="grid gap-3 md:grid-cols-[1.2fr,1fr,auto,auto]" method="get">
              <Input defaultValue={filters.query} name="q" placeholder="Search segment or description" />
              <Input defaultValue={filters.marketLane} name="marketLane" placeholder="Filter by market lane" />
              <Button type="submit" variant="secondary">
                Apply filters
              </Button>
              <Link className={buttonStyles({ variant: "ghost" })} href="/audiences">
                Reset
              </Link>
            </form>

            {items.length > 0 ? (
              <TableWrapper>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Segment</TableHead>
                      <TableHead>Market lane</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Leads</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((segment) => (
                      <TableRow key={segment.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-white">{segment.name}</p>
                            <p className="max-w-lg text-sm leading-6 text-slate-400">
                              {segment.description ?? "No description added yet."}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{segment.marketLane ?? "Unassigned"}</TableCell>
                        <TableCell>{segment.tags.length > 0 ? segment.tags.join(", ") : "None"}</TableCell>
                        <TableCell>{segment.leadCount}</TableCell>
                        <TableCell>{formatDate(segment.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableWrapper>
            ) : (
              <EmptyState
                description="No audience segments are stored yet. Create the first segment to organize targeting and lead routing."
                title="No audience segments yet"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
