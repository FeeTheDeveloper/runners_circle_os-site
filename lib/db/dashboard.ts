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
        label: "Total campaigns",
        value: "0",
        description: "Campaigns tracked in the operating system.",
        tone: "neutral"
      },
      {
        label: "Queued / scheduled content",
        value: "0",
        description: "Content approved or scheduled for execution.",
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
        label: "Pending jobs",
        value: "0",
        description: "Automation jobs queued or actively running.",
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
          prisma.contentItem.count({
            where: {
              status: {
                in: ["APPROVED", "SCHEDULED"]
              }
            }
          }),
          prisma.audienceSegment.count(),
          prisma.lead.count(),
          prisma.automationJob.count({
            where: {
              status: {
                in: ["QUEUED", "RUNNING"]
              }
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
            label: "Total campaigns",
            value: String(campaignCount),
            description: "Campaigns tracked in the operating system.",
            tone: "neutral" as const
          },
          {
            label: "Queued / scheduled content",
            value: String(contentCount),
            description: "Content approved or scheduled for execution.",
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
            label: "Pending jobs",
            value: String(pendingJobs),
            description: "Automation jobs queued or actively running.",
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
