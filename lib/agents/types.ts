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

export type AgentOutputOption = {
  value: string;
  label: string;
  description: string;
};

export type AgentDefinition = {
  type: AgentTypeValue;
  label: string;
  description: string;
  goalPlaceholder: string;
  previewLabel: string;
  defaultOutputType: string;
  recommendedJobType: AgentJobTypeValue;
  outputTypes: AgentOutputOption[];
};

export type AgentPromptBuilderInput = {
  agentType: AgentTypeValue;
  brandSlug: string;
  goal: string;
  campaignId?: string | null;
  campaignName?: string | null;
  platform?: string | null;
  outputType: string;
  contentId?: string | null;
  contentTitle?: string | null;
};

export type BuiltAgentPrompt = {
  title: string;
  prompt: string;
  payload: {
    agentType: AgentTypeValue;
    brandSlug: string;
    goal: string;
    outputType: string;
    campaignId: string | null;
    campaignName: string | null;
    platform: string | null;
    contentId: string | null;
    contentTitle: string | null;
    sections: string[];
    recommendedJobType: AgentJobTypeValue;
  };
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
  brandSlug: string;
  goal: string;
  outputType: string;
  recommendedJobType: AgentJobTypeValue;
  campaignId: string | null;
  campaignName: string | null;
  contentId: string | null;
  contentTitle: string | null;
  platform: string | null;
  createdById: string;
  supabaseUserId: string;
};
