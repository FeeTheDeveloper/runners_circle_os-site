import "server-only";

import { prisma, runReadQuery } from "@/lib/db";

export type DashboardMetric = {
  label: string;
  value: string;
  description: string;
  tone: "neutral" | "success" | "warning" | "danger" | "info";
};

export type DashboardCampaign = {
  id: string;
  name: string;
  status: string;
  objective: string;
  endDate: Date | null;
};

export type DashboardJob = {
  id: string;
  type: string;
  status: string;
  scheduledFor: Date | null;
};

export type DashboardData = {
  source: "database" | "unavailable";
  metrics: DashboardMetric[];
  campaigns: DashboardCampaign[];
  jobs: DashboardJob[];
};

function emptyDashboardData(): Omit<DashboardData, "source"> {
  return {
    metrics: [
      {
        label: "Campaigns",
        value: "0",
        description: "Campaign records tracked in the operating system.",
        tone: "neutral"
      },
      {
        label: "Content items",
        value: "0",
        description: "Content records linked to publishing and planning workflows.",
        tone: "info"
      },
      {
        label: "Audience segments",
        value: "0",
        description: "Segments available for targeting and routing.",
        tone: "warning"
      },
      {
        label: "Total leads",
        value: "0",
        description: "Lead records currently stored in the CRM workspace.",
        tone: "success"
      },
      {
        label: "Queued automation jobs",
        value: "0",
        description: "Automation jobs waiting in the queue for execution.",
        tone: "neutral"
      }
    ],
    campaigns: [],
    jobs: []
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  const result = await runReadQuery({
    query: async () => {
      const [campaignCount, contentCount, segmentCount, leadCount, pendingJobs, campaigns, jobs] =
        await Promise.all([
          prisma.campaign.count(),
          prisma.contentItem.count(),
          prisma.audienceSegment.count(),
          prisma.lead.count(),
          prisma.automationJob.count({
            where: {
              status: "QUEUED"
            }
          }),
          prisma.campaign.findMany({
            orderBy: [{ createdAt: "desc" }],
            take: 5,
            select: {
              id: true,
              name: true,
              status: true,
              objective: true,
              endDate: true
            }
          }),
          prisma.automationJob.findMany({
            where: {
              status: "QUEUED"
            },
            orderBy: [{ scheduledFor: "asc" }, { createdAt: "desc" }],
            take: 5,
            select: {
              id: true,
              type: true,
              status: true,
              scheduledFor: true
            }
          })
        ]);

      return {
        metrics: [
          {
            label: "Campaigns",
            value: String(campaignCount),
            description: "Campaign records tracked in the operating system.",
            tone: "neutral" as const
          },
          {
            label: "Content items",
            value: String(contentCount),
            description: "Content records linked to publishing and planning workflows.",
            tone: "info" as const
          },
          {
            label: "Audience segments",
            value: String(segmentCount),
            description: "Segments available for targeting and routing.",
            tone: "warning" as const
          },
          {
            label: "Total leads",
            value: String(leadCount),
            description: "Lead records currently stored in the CRM workspace.",
            tone: "success" as const
          },
          {
            label: "Queued automation jobs",
            value: String(pendingJobs),
            description: "Automation jobs waiting in the queue for execution.",
            tone: "neutral" as const
          }
        ],
        campaigns,
        jobs
      };
    },
    fallback: async () => emptyDashboardData()
  });

  return {
    source: result.source,
    ...result.data
  };
}
