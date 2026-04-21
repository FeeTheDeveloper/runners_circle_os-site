import type { CreatorTemplateKey } from "@/lib/creator/types";
import type { DataSource } from "@/lib/db";
import type { CreatorRequestListItem, CreatorWorkspaceSummary, GeneratedAssetListItem } from "@/lib/db/creator";

import { CreatorRequestForm } from "@/components/creator/creator-request-form";
import { buttonStyles } from "@/components/ui/button";
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
import { getBrandKit } from "@/lib/creator/brand-kits";
import { getCreatorTemplate } from "@/lib/creator/template-registry";
import { formatDateTime, formatTokenLabel } from "@/lib/utils/format";

type CreatorWorkspaceProps = {
  campaigns: Array<{
    id: string;
    name: string;
  }>;
  requests: CreatorRequestListItem[];
  assets: GeneratedAssetListItem[];
  source: DataSource;
  summary: CreatorWorkspaceSummary;
};

function getContentSearchHref(asset: GeneratedAssetListItem) {
  const query = asset.contentTitle ?? asset.title;

  return `/content?q=${encodeURIComponent(query)}`;
}

export function CreatorWorkspace({ campaigns, requests, assets, source, summary }: CreatorWorkspaceProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          description="Total creator requests tracked in the engine."
          label="Requests"
          value={String(summary.totalRequests)}
        />
        <StatCard
          description="Requests waiting for queue pickup or manual execution."
          label="Queued"
          tone="warning"
          value={String(summary.queuedRequests)}
        />
        <StatCard
          description="Requests currently being processed through the internal generation flow."
          label="Processing"
          tone="info"
          value={String(summary.processingRequests)}
        />
        <StatCard
          description="Generated assets already registered and attached to the workspace."
          label="Assets"
          tone="success"
          value={String(summary.totalAssets)}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <div className="space-y-6">
          <CreatorRequestForm campaigns={campaigns} />

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle>Recent creator requests</CardTitle>
                  <CardDescription>
                    Queue image and video generation work without leaving the authenticated ops workspace.
                  </CardDescription>
                </div>
                <DataSourceBadge source={source} />
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {requests.length > 0 ? (
                <TableWrapper>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Request</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Campaign</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Assets</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((request) => {
                        const template = getCreatorTemplate(request.templateKey as CreatorTemplateKey);
                        const brand = getBrandKit(request.brandSlug);

                        return (
                          <TableRow key={request.id}>
                            <TableCell>
                              <div className="space-y-1">
                                <p className="font-medium text-white">{request.headline}</p>
                                <p className="text-xs text-slate-400">
                                  {brand.label} | {template?.label ?? formatTokenLabel(request.templateKey)}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {formatTokenLabel(request.type)} | {formatTokenLabel(request.platform)}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={request.status} />
                            </TableCell>
                            <TableCell>{request.campaignName ?? "Unassigned"}</TableCell>
                            <TableCell>{formatDateTime(request.createdAt)}</TableCell>
                            <TableCell>{String(request.generatedAssetCount)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableWrapper>
              ) : (
                <EmptyState
                  description="Creator requests will appear here as soon as you submit the first image or video generation job."
                  title="No creator requests yet"
                />
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Generated asset library</CardTitle>
            <CardDescription>
              Review the latest generated outputs, open the rendered asset, and jump into related content when a
              content item was created.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {assets.length > 0 ? (
              <TableWrapper>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-white">{asset.title}</p>
                            <p className="text-xs text-slate-400">
                              {formatTokenLabel(asset.assetType)}
                              {asset.width && asset.height ? ` | ${asset.width}x${asset.height}` : ""}
                              {asset.durationSec ? ` | ${asset.durationSec}s` : ""}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={asset.status} />
                        </TableCell>
                        <TableCell>{asset.campaignName ?? "Unassigned"}</TableCell>
                        <TableCell>
                          {asset.contentTitle ? (
                            <a className="text-sm text-sky-300 hover:text-sky-200" href={getContentSearchHref(asset)}>
                              {asset.contentTitle}
                            </a>
                          ) : (
                            "Not linked"
                          )}
                        </TableCell>
                        <TableCell>{formatDateTime(asset.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <a
                              className={buttonStyles({ size: "md", variant: "secondary" })}
                              href={asset.url}
                              rel="noreferrer"
                              target="_blank"
                            >
                              Open asset
                            </a>
                            {asset.contentTitle ? (
                              <a className={buttonStyles({ size: "md", variant: "ghost" })} href={getContentSearchHref(asset)}>
                                View content
                              </a>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableWrapper>
            ) : (
              <EmptyState
                description="Generated images and video previews will land here after creator jobs complete."
                title="No assets generated yet"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
