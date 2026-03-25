import "server-only";

import type { LeadStatus } from "@prisma/client";

import { prisma, runReadQuery } from "@/lib/db";

export type LeadFilters = {
  query: string;
  status: LeadStatus | "ALL";
};

export type LeadListItem = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string | null;
  source: string | null;
  status: LeadStatus;
  tags: string[];
  notes: string | null;
  segmentId: string | null;
  segmentName: string | null;
  createdAt: Date;
};

export type LeadSummary = {
  total: number;
  newCount: number;
  qualified: number;
  nurturing: number;
};

export async function listLeads(filters: LeadFilters) {
  const result = await runReadQuery({
    query: async () => {
      const [items, total, newCount, qualified, nurturing] = await Promise.all([
        prisma.lead.findMany({
          where: {
            ...(filters.status !== "ALL" ? { status: filters.status } : {}),
            ...(filters.query
              ? {
                  OR: [
                    { firstName: { contains: filters.query, mode: "insensitive" as const } },
                    { lastName: { contains: filters.query, mode: "insensitive" as const } },
                    { email: { contains: filters.query, mode: "insensitive" as const } },
                    { company: { contains: filters.query, mode: "insensitive" as const } },
                    { source: { contains: filters.query, mode: "insensitive" as const } }
                  ]
                }
              : {})
          },
          orderBy: [{ createdAt: "desc" }],
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            company: true,
            source: true,
            status: true,
            tags: true,
            notes: true,
            segmentId: true,
            createdAt: true,
            segment: {
              select: {
                name: true
              }
            }
          }
        }),
        prisma.lead.count(),
        prisma.lead.count({ where: { status: "NEW" } }),
        prisma.lead.count({ where: { status: "QUALIFIED" } }),
        prisma.lead.count({ where: { status: "NURTURING" } })
      ]);

      return {
        items: items.map((item) => ({
          ...item,
          segmentName: item.segment?.name ?? null
        })),
        summary: {
          total,
          newCount,
          qualified,
          nurturing
        }
      };
    },
    fallback: async () => ({
      items: [],
      summary: {
        total: 0,
        newCount: 0,
        qualified: 0,
        nurturing: 0
      }
    })
  });

  return result;
}
