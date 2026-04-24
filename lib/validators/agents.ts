import { z } from "zod";

import { getAgentDefinition } from "@/lib/agents/agent-registry";
import { businessPresets } from "@/lib/agents/business-presets";
import { getOutputPreset } from "@/lib/agents/output-presets";
import { agentJobTypeOptions, agentTypeOptions } from "@/lib/agents/types";
import { contentPlatformOptions } from "@/lib/utils/domain-options";

const knownBusinessSlugs = businessPresets.map((business) => business.slug);

const baseAgentFields = z.object({
  agentType: z.enum(agentTypeOptions),
  businessSlug: z.string().trim().refine((value) => knownBusinessSlugs.includes(value), {
    message: "Choose a supported business."
  }),
  goal: z.string().trim().min(8).max(500),
  outputPresetKey: z.string().trim().min(2).max(120),
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

  const outputPreset = getOutputPreset(value.outputPresetKey);

  if (!outputPreset || !outputPreset.agentTypes.includes(value.agentType)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Choose a valid output preset for the selected agent.",
      path: ["outputPresetKey"]
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
