import "server-only";

import { prisma, runReadQuery } from "@/lib/db";

export type AudienceFilters = {
  query: string;
  marketLane: string;
};

export type AudienceListItem = {
  id: string;
  name: string;
  description: string | null;
  marketLane: string | null;
  tags: string[];
  leadCount: number;
  createdAt: Date;
};

export type AudienceSummary = {
  total: number;
  withLeads: number;
  tagged: number;
  marketLanes: number;
};

export async function listAudienceSegments(filters: AudienceFilters) {
  const result = await runReadQuery({
    query: async () => {
      const [items, total, taggedItems, withLeadsItems, marketLaneRows] = await Promise.all([
        prisma.audienceSegment.findMany({
          where: {
            ...(filters.marketLane
              ? {
                  marketLane: {
                    contains: filters.marketLane,
                    mode: "insensitive" as const
                  }
                }
              : {}),
            ...(filters.query
              ? {
                  OR: [
                    { name: { contains: filters.query, mode: "insensitive" as const } },
                    { description: { contains: filters.query, mode: "insensitive" as const } }
                  ]
                }
              : {})
          },
          orderBy: [{ createdAt: "desc" }],
          select: {
            id: true,
            name: true,
            description: true,
            marketLane: true,
            tags: true,
            createdAt: true,
            _count: {
              select: {
                leads: true
              }
            }
          }
        }),
        prisma.audienceSegment.count(),
        prisma.audienceSegment.findMany({
          where: {
            tags: {
              isEmpty: false
            }
          },
          select: {
            id: true
          }
        }),
        prisma.audienceSegment.findMany({
          where: {
            leads: {
              some: {}
            }
          },
          select: {
            id: true
          }
        }),
        prisma.audienceSegment.findMany({
          where: {
            marketLane: {
              not: null
            }
          },
          distinct: ["marketLane"],
          select: {
            marketLane: true
          }
        })
      ]);

      return {
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          marketLane: item.marketLane,
          tags: item.tags,
          leadCount: item._count.leads,
          createdAt: item.createdAt
        })),
        summary: {
          total,
          withLeads: withLeadsItems.length,
          tagged: taggedItems.length,
          marketLanes: marketLaneRows.length
        }
      };
    },
    fallback: async () => ({
      items: [],
      summary: {
        total: 0,
        withLeads: 0,
        tagged: 0,
        marketLanes: 0
      }
    })
  });

  return result;
}

export async function listAudienceSegmentOptions() {
  const result = await runReadQuery({
    query: async () =>
      prisma.audienceSegment.findMany({
        orderBy: [{ name: "asc" }],
        select: {
          id: true,
          name: true
        }
      }),
    fallback: async () => []
  });

  return result.data;
}
