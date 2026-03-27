import { Prisma, type AutomationJob, type JobStatus, type JobType } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { runReadQuery } from "@/lib/db/runtime";

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
  failed: number;
};

export async function listAutomationJobs(filters: JobFilters) {
  const result = await runReadQuery({
    query: async () => {
      const [items, total, queued, running, succeeded, failed] = await Promise.all([
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
        prisma.automationJob.count({ where: { status: "SUCCEEDED" } }),
        prisma.automationJob.count({ where: { status: "FAILED" } })
      ]);

      return {
        items,
        summary: {
          total,
          queued,
          running,
          succeeded,
          failed
        }
      };
    },
    fallback: async () => ({
      items: [],
      summary: {
        total: 0,
        queued: 0,
        running: 0,
        succeeded: 0,
        failed: 0
      }
    })
  });

  return result;
}

export async function getQueuedJobs(now = new Date()): Promise<AutomationJob[]> {
  return prisma.automationJob.findMany({
    where: {
      status: "QUEUED",
      scheduledFor: {
        lte: now
      }
    },
    orderBy: [{ scheduledFor: "asc" }, { createdAt: "asc" }]
  });
}

export async function getRunningJobs(): Promise<AutomationJob[]> {
  return prisma.automationJob.findMany({
    where: {
      status: "RUNNING"
    },
    orderBy: [{ startedAt: "asc" }, { createdAt: "asc" }]
  });
}

export async function getAutomationJobById(id: string): Promise<AutomationJob | null> {
  return prisma.automationJob.findUnique({
    where: {
      id
    }
  });
}

async function getExistingJobOrThrow(id: string): Promise<AutomationJob> {
  const job = await prisma.automationJob.findUnique({
    where: {
      id
    }
  });

  if (!job) {
    throw new Error(`Automation job ${id} could not be found.`);
  }

  return job;
}

export async function markJobRunning(id: string): Promise<AutomationJob> {
  const transition = await prisma.automationJob.updateMany({
    where: {
      id,
      status: "QUEUED"
    },
    data: {
      status: "RUNNING",
      startedAt: new Date(),
      completedAt: null,
      result: Prisma.DbNull
    }
  });

  if (transition.count === 0) {
    const job = await getExistingJobOrThrow(id);

    throw new Error(`Automation job ${id} is ${job.status} and cannot transition to RUNNING.`);
  }

  return getExistingJobOrThrow(id);
}

export async function markJobComplete(id: string, result: Prisma.InputJsonValue): Promise<AutomationJob> {
  return prisma.automationJob.update({
    where: {
      id
    },
    data: {
      status: "SUCCEEDED",
      completedAt: new Date(),
      result
    }
  });
}

export async function markJobFailed(id: string, error: unknown): Promise<AutomationJob> {
  const message = error instanceof Error ? error.message : String(error);

  return prisma.automationJob.update({
    where: {
      id
    },
    data: {
      status: "FAILED",
      completedAt: new Date(),
      result: {
        error: message
      }
    }
  });
}
