import "server-only";

import { agentTypeFromDb } from "@/lib/agents/types";
import { prisma, runReadQuery } from "@/lib/db";

export type AgentPromptListItem = {
  id: string;
  agentType: string;
  title: string;
  prompt: string;
  status: string;
  businessSlug: string | null;
  businessLabel: string | null;
  outputPresetKey: string | null;
  outputLabel: string | null;
  recommendedJobType: string | null;
  campaignId: string | null;
  campaignName: string | null;
  contentId: string | null;
  contentTitle: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AgentsWorkspaceSummary = {
  totalPrompts: number;
  queuedPrompts: number;
  completedPrompts: number;
  failedPrompts: number;
};

function getPayloadValue(payload: unknown, key: string) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const value = (payload as Record<string, unknown>)[key];

  return typeof value === "string" && value.length > 0 ? value : null;
}

export async function getAgentsWorkspaceData() {
  return runReadQuery({
    query: async () => {
      const [prompts, totalPrompts, queuedPrompts, completedPrompts, failedPrompts] = await Promise.all([
        prisma.agentPrompt.findMany({
          orderBy: [{ createdAt: "desc" }],
          take: 12,
          select: {
            id: true,
            agentType: true,
            title: true,
            prompt: true,
            payload: true,
            status: true,
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
        prisma.agentPrompt.count(),
        prisma.agentPrompt.count({ where: { status: "QUEUED" } }),
        prisma.agentPrompt.count({ where: { status: "COMPLETED" } }),
        prisma.agentPrompt.count({ where: { status: "FAILED" } })
      ]);

      return {
        prompts: prompts.map((prompt) => ({
          id: prompt.id,
          agentType: agentTypeFromDb[prompt.agentType],
          title: prompt.title,
          prompt: prompt.prompt,
          status: prompt.status.toLowerCase(),
          businessSlug: getPayloadValue(prompt.payload, "businessSlug") ?? getPayloadValue(prompt.payload, "brandSlug"),
          businessLabel: getPayloadValue(prompt.payload, "businessLabel"),
          outputPresetKey: getPayloadValue(prompt.payload, "outputPresetKey") ?? getPayloadValue(prompt.payload, "outputType"),
          outputLabel: getPayloadValue(prompt.payload, "outputLabel"),
          recommendedJobType: getPayloadValue(prompt.payload, "recommendedJobType"),
          campaignId: prompt.campaignId,
          campaignName: prompt.campaign?.name ?? null,
          contentId: prompt.contentId,
          contentTitle: prompt.content?.title ?? null,
          createdAt: prompt.createdAt,
          updatedAt: prompt.updatedAt
        })),
        summary: {
          totalPrompts,
          queuedPrompts,
          completedPrompts,
          failedPrompts
        }
      };
    },
    fallback: async () => ({
      prompts: [],
      summary: {
        totalPrompts: 0,
        queuedPrompts: 0,
        completedPrompts: 0,
        failedPrompts: 0
      }
    })
  });
}
