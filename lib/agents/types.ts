import type { ContentPlatform } from "@/lib/utils/domain-options";

export const agentTypeOptions = [
  "campaign_builder",
  "content_creator",
  "video_prompt",
  "automation_builder"
] as const;

export const agentJobTypeOptions = [
  "generate_campaign_plan",
  "generate_content_pack",
  "generate_video_prompt",
  "generate_automation_prompt"
] as const;

export const agentPromptStatusOptions = ["queued", "processing", "completed", "failed"] as const;

export type AgentTypeValue = (typeof agentTypeOptions)[number];
export type AgentJobTypeValue = (typeof agentJobTypeOptions)[number];
export type AgentPromptStatusValue = (typeof agentPromptStatusOptions)[number];

export type OutputPresetPayloadValue = string | number | boolean | null;
export type OutputPresetPayload = Record<string, OutputPresetPayloadValue>;

export type AgentDefinition = {
  key: AgentTypeValue;
  label: string;
  description: string;
  goalPlaceholder: string;
  previewLabel: string;
  recommendedJobType: AgentJobTypeValue;
};

export type BusinessPreset = {
  slug: string;
  label: string;
  description: string;
  defaultGoals: string[];
  defaultCtas: string[];
};

export type OutputPreset = {
  key: string;
  label: string;
  agentTypes: AgentTypeValue[];
  payload: OutputPresetPayload;
};

export type AgentPromptBuilderInput = {
  agent: AgentDefinition;
  business: BusinessPreset;
  goal: string;
  outputPreset: OutputPreset;
  campaignId?: string | null;
  campaignName?: string | null;
  platform?: ContentPlatform | null;
  contentId?: string | null;
  contentTitle?: string | null;
};

export type BuiltAgentPromptPayload = {
  agentType: AgentTypeValue;
  businessSlug: string;
  businessLabel: string;
  businessDescription: string;
  brandSlug: string;
  goal: string;
  outputPresetKey: string;
  outputLabel: string;
  outputType: string;
  outputConfig: OutputPresetPayload;
  campaignId: string | null;
  campaignName: string | null;
  platform: ContentPlatform | null;
  contentId: string | null;
  contentTitle: string | null;
  sections: string[];
  defaultCtas: string[];
  recommendedJobType: AgentJobTypeValue;
  postCount: number | null;
  videoScriptCount: number | null;
  includeCaptions: boolean | null;
  includeImagePrompts: boolean | null;
  includeCtas: boolean | null;
};

export type BuiltAgentPrompt = {
  title: string;
  prompt: string;
  payload: BuiltAgentPromptPayload;
  recommendedJobType: AgentJobTypeValue;
};

export const agentTypeToDb = {
  campaign_builder: "CAMPAIGN_BUILDER",
  content_creator: "CONTENT_CREATOR",
  video_prompt: "VIDEO_PROMPT",
  automation_builder: "AUTOMATION_BUILDER"
} as const;

export const agentTypeFromDb = {
  CAMPAIGN_BUILDER: "campaign_builder",
  CONTENT_CREATOR: "content_creator",
  VIDEO_PROMPT: "video_prompt",
  AUTOMATION_BUILDER: "automation_builder"
} as const;

export const agentPromptStatusToDb = {
  queued: "QUEUED",
  processing: "PROCESSING",
  completed: "COMPLETED",
  failed: "FAILED"
} as const;

export const agentPromptStatusFromDb = {
  QUEUED: "queued",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed"
} as const;

export const agentJobTypeToDb = {
  generate_campaign_plan: "GENERATE_CAMPAIGN_PLAN",
  generate_content_pack: "GENERATE_CONTENT_PACK",
  generate_video_prompt: "GENERATE_VIDEO_PROMPT",
  generate_automation_prompt: "GENERATE_AUTOMATION_PROMPT"
} as const;

export const agentJobTypeFromDb = {
  GENERATE_CAMPAIGN_PLAN: "generate_campaign_plan",
  GENERATE_CONTENT_PACK: "generate_content_pack",
  GENERATE_VIDEO_PROMPT: "generate_video_prompt",
  GENERATE_AUTOMATION_PROMPT: "generate_automation_prompt"
} as const;

export type AgentPromptJobPayload = {
  agentPromptId: string;
  agentType: AgentTypeValue;
  promptTitle: string;
  prompt: string;
  businessSlug: string;
  businessLabel: string;
  brandSlug: string;
  goal: string;
  outputPresetKey: string;
  outputLabel: string;
  outputType: string;
  recommendedJobType: AgentJobTypeValue;
  campaignId: string | null;
  campaignName: string | null;
  contentId: string | null;
  contentTitle: string | null;
  platform: ContentPlatform | null;
  createdById: string;
  supabaseUserId: string;
  postCount: number | null;
  videoScriptCount: number | null;
  includeCaptions: boolean | null;
  includeImagePrompts: boolean | null;
  includeCtas: boolean | null;
};
