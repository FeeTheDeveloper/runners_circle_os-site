import "server-only";

import type { CampaignStatus } from "@prisma/client";

import { prisma, runReadQuery } from "@/lib/db";

export type CampaignFilters = {
  query: string;
  status: CampaignStatus | "ALL";
};

export type CampaignListItem = {
  id: string;
  name: string;
  objective: string;
  description: string | null;
  status: CampaignStatus;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
};

export type CampaignSummary = {
  total: number;
  active: number;
  planned: number;
  completed: number;
};

export async function listCampaigns(filters: CampaignFilters) {
  const result = await runReadQuery({
    query: async () => {
      const where = {
        ...(filters.status !== "ALL" ? { status: filters.status } : {}),
        ...(filters.query
          ? {
              OR: [
                { name: { contains: filters.query, mode: "insensitive" as const } },
                { objective: { contains: filters.query, mode: "insensitive" as const } },
                { description: { contains: filters.query, mode: "insensitive" as const } }
              ]
            }
          : {})
      };

      const [items, total, active, planned, completed] = await Promise.all([
        prisma.campaign.findMany({
          where,
          orderBy: [{ createdAt: "desc" }],
          select: {
            id: true,
            name: true,
            objective: true,
            description: true,
            status: true,
            startDate: true,
            endDate: true,
            createdAt: true
          }
        }),
        prisma.campaign.count(),
        prisma.campaign.count({ where: { status: "ACTIVE" } }),
        prisma.campaign.count({ where: { status: "PLANNED" } }),
        prisma.campaign.count({ where: { status: "COMPLETED" } })
      ]);

      return {
        items,
        summary: {
          total,
          active,
          planned,
          completed
        }
      };
    },
    fallback: async () => ({
      items: [],
      summary: {
        total: 0,
        active: 0,
        planned: 0,
        completed: 0
      }
    })
  });

  return result;
}

export async function listCampaignOptions() {
  const result = await runReadQuery({
    query: async () =>
      prisma.campaign.findMany({
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
