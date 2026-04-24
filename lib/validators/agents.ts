import { z } from "zod";

import { getAgentDefinition } from "@/lib/agents/agent-registry";
import { agentJobTypeOptions, agentTypeOptions } from "@/lib/agents/types";
import { brandKits } from "@/lib/creator/brand-kits";
import { contentPlatformOptions } from "@/lib/utils/domain-options";

const knownBrandSlugs = brandKits.map((brand) => brand.slug);

const baseAgentFields = z.object({
  agentType: z.enum(agentTypeOptions),
  brandSlug: z.string().trim().refine((value) => knownBrandSlugs.includes(value), {
    message: "Choose a supported brand."
  }),
  goal: z.string().trim().min(8).max(500),
  outputType: z.string().trim().min(2).max(80),
  campaignId: z.string().trim().min(1).optional().nullable(),
  platform: z.enum(contentPlatformOptions).optional().nullable(),
  contentId: z.string().trim().min(1).optional().nullable()
});

export const generateAgentPromptSchema = baseAgentFields.superRefine((value, ctx) => {
  const definition = getAgentDefinition(value.agentType);

  if (!definition) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Choose a supported agent type.",
      path: ["agentType"]
    });
    return;
  }

  const validOutputType = definition.outputTypes.some((option) => option.value === value.outputType);

  if (!validOutputType) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Choose a valid output type for the selected agent.",
      path: ["outputType"]
    });
  }
});

export const approveAgentPromptSchema = z.object({
  agentType: z.enum(agentTypeOptions),
  title: z.string().trim().min(3).max(180),
  prompt: z.string().trim().min(20),
  payloadJson: z.string().trim().min(2),
  recommendedJobType: z.enum(agentJobTypeOptions),
  campaignId: z.string().trim().min(1).optional().nullable(),
  contentId: z.string().trim().min(1).optional().nullable()
});
