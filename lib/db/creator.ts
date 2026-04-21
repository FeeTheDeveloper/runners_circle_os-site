import "server-only";

import { prisma, runReadQuery } from "@/lib/db";

export type CreatorRequestListItem = {
  id: string;
  type: string;
  templateKey: string;
  platform: string;
  format: string;
  brandSlug: string;
  headline: string;
  cta: string;
  status: string;
  campaignId: string | null;
  campaignName: string | null;
  createdAt: Date;
  updatedAt: Date;
  generatedAssetCount: number;
};

export type GeneratedAssetListItem = {
  id: string;
  requestId: string;
  assetType: string;
  title: string;
  url: string;
  status: string;
  width: number | null;
  height: number | null;
  durationSec: number | null;
  campaignId: string | null;
  campaignName: string | null;
  contentId: string | null;
  contentTitle: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreatorWorkspaceSummary = {
  totalRequests: number;
  queuedRequests: number;
  processingRequests: number;
  completedRequests: number;
  totalAssets: number;
};

export async function getCreatorWorkspaceData() {
  return runReadQuery({
    query: async () => {
      const [requests, assets, totalRequests, queuedRequests, processingRequests, completedRequests, totalAssets] =
        await Promise.all([
          prisma.creatorRequest.findMany({
            orderBy: [{ createdAt: "desc" }],
            take: 10,
            select: {
              id: true,
              type: true,
              templateKey: true,
              platform: true,
              format: true,
              brandSlug: true,
              headline: true,
              cta: true,
              status: true,
              campaignId: true,
              createdAt: true,
              updatedAt: true,
              campaign: {
                select: {
                  name: true
                }
              },
              _count: {
                select: {
                  generatedAssets: true
                }
              }
            }
          }),
          prisma.generatedAsset.findMany({
            orderBy: [{ createdAt: "desc" }],
            take: 10,
            select: {
              id: true,
              requestId: true,
              assetType: true,
              title: true,
              url: true,
              status: true,
              width: true,
              height: true,
              durationSec: true,
              campaignId: true,
              contentId: true,
              createdAt: true,
              updatedAt: true,
              campaign: {
                select: {
                  name: true
                }
              },
              content: {
                select: {
                  title: true
                }
              }
            }
          }),
          prisma.creatorRequest.count(),
          prisma.creatorRequest.count({ where: { status: "QUEUED" } }),
          prisma.creatorRequest.count({ where: { status: "PROCESSING" } }),
          prisma.creatorRequest.count({ where: { status: "COMPLETED" } }),
          prisma.generatedAsset.count()
        ]);

      return {
        requests: requests.map((request) => ({
          id: request.id,
          type: request.type,
          templateKey: request.templateKey,
          platform: request.platform,
          format: request.format,
          brandSlug: request.brandSlug,
          headline: request.headline,
          cta: request.cta,
          status: request.status,
          campaignId: request.campaignId,
          campaignName: request.campaign?.name ?? null,
          createdAt: request.createdAt,
          updatedAt: request.updatedAt,
          generatedAssetCount: request._count.generatedAssets
        })),
        assets: assets.map((asset) => ({
          id: asset.id,
          requestId: asset.requestId,
          assetType: asset.assetType,
          title: asset.title,
          url: asset.url,
          status: asset.status,
          width: asset.width,
          height: asset.height,
          durationSec: asset.durationSec,
          campaignId: asset.campaignId,
          campaignName: asset.campaign?.name ?? null,
          contentId: asset.contentId,
          contentTitle: asset.content?.title ?? null,
          createdAt: asset.createdAt,
          updatedAt: asset.updatedAt
        })),
        summary: {
          totalRequests,
          queuedRequests,
          processingRequests,
          completedRequests,
          totalAssets
        }
      };
    },
    fallback: async () => ({
      requests: [],
      assets: [],
      summary: {
        totalRequests: 0,
        queuedRequests: 0,
        processingRequests: 0,
        completedRequests: 0,
        totalAssets: 0
      }
    })
  });
}
