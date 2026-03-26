import "server-only";

import type { JobStatus, JobType } from "@prisma/client";

import { prisma, runReadQuery } from "@/lib/db";

export type JobFilters = {
  status: JobStatus | "ALL";
  type: JobType | "ALL";
};

export type JobListItem = {
  id: string;
  type: JobType;
  status: JobStatus;
  scheduledFor: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
};

export type JobSummary = {
  total: number;
  queued: number;
  running: number;
  succeeded: number;
};

export async function listAutomationJobs(filters: JobFilters) {
  const result = await runReadQuery({
    query: async () => {
      const [items, total, queued, running, succeeded] = await Promise.all([
        prisma.automationJob.findMany({
          where: {
            ...(filters.status !== "ALL" ? { status: filters.status } : {}),
            ...(filters.type !== "ALL" ? { type: filters.type } : {})
          },
          orderBy: [{ scheduledFor: "asc" }, { createdAt: "desc" }],
          select: {
            id: true,
            type: true,
            status: true,
            scheduledFor: true,
            startedAt: true,
            completedAt: true,
            createdAt: true
          }
        }),
        prisma.automationJob.count(),
        prisma.automationJob.count({ where: { status: "QUEUED" } }),
        prisma.automationJob.count({ where: { status: "RUNNING" } }),
        prisma.automationJob.count({ where: { status: "SUCCEEDED" } })
      ]);

      return {
        items,
        summary: {
          total,
          queued,
          running,
          succeeded
        }
      };
    },
    fallback: async () => ({
      items: [],
      summary: {
        total: 0,
        queued: 0,
        running: 0,
        succeeded: 0
      }
    })
  });

  return result;
}
