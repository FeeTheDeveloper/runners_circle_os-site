import "server-only";

import type { ContentPlatform, ContentStatus } from "@prisma/client";

import { prisma, runReadQuery } from "@/lib/db";

export type ContentFilters = {
  query: string;
  status: ContentStatus | "ALL";
  platform: ContentPlatform | "ALL";
};

export type ContentListItem = {
  id: string;
  title: string;
  platform: ContentPlatform;
  format: string;
  copy: string;
  mediaUrl: string | null;
  status: ContentStatus;
  scheduledFor: Date | null;
  createdAt: Date;
  campaignId: string | null;
  campaignName: string | null;
};

export type ContentSummary = {
  total: number;
  scheduled: number;
  inReview: number;
  published: number;
};

export async function listContentItems(filters: ContentFilters) {
  const result = await runReadQuery({
    query: async () => {
      const [items, total, scheduled, inReview, published] = await Promise.all([
        prisma.contentItem.findMany({
          where: {
            ...(filters.status !== "ALL" ? { status: filters.status } : {}),
            ...(filters.platform !== "ALL" ? { platform: filters.platform } : {}),
            ...(filters.query
              ? {
                  OR: [
                    { title: { contains: filters.query, mode: "insensitive" as const } },
                    { copy: { contains: filters.query, mode: "insensitive" as const } },
                    { format: { contains: filters.query, mode: "insensitive" as const } },
                    {
                      campaign: {
                        is: {
                          name: { contains: filters.query, mode: "insensitive" as const }
                        }
                      }
                    }
                  ]
                }
              : {})
          },
          orderBy: [{ scheduledFor: "asc" }, { createdAt: "desc" }],
          select: {
            id: true,
            title: true,
            platform: true,
            format: true,
            copy: true,
            mediaUrl: true,
            status: true,
            scheduledFor: true,
            createdAt: true,
            campaignId: true,
            campaign: {
              select: {
                name: true
              }
            }
          }
        }),
        prisma.contentItem.count(),
        prisma.contentItem.count({
          where: {
            status: {
              in: ["APPROVED", "SCHEDULED"]
            }
          }
        }),
        prisma.contentItem.count({ where: { status: "REVIEW" } }),
        prisma.contentItem.count({ where: { status: "PUBLISHED" } })
      ]);

      return {
        items: items.map((item) => ({
          ...item,
          campaignName: item.campaign?.name ?? null
        })),
        summary: {
          total,
          scheduled,
          inReview,
          published
        }
      };
    },
    fallback: async () => ({
      items: [],
      summary: {
        total: 0,
        scheduled: 0,
        inReview: 0,
        published: 0
      }
    })
  });

  return result;
}
