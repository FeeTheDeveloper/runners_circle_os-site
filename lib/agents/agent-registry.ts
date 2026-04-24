import type { AgentDefinition, AgentTypeValue } from "@/lib/agents/types";

export const agentRegistry: AgentDefinition[] = [
  {
    key: "campaign_builder",
    label: "Campaign Builder",
    description: "Generate a campaign plan with offer, audience, content ideas, CTA options, and a job list.",
    goalPlaceholder: "Launch a service offer and build a 30-day campaign plan.",
    previewLabel: "Campaign plan prompt",
    recommendedJobType: "generate_campaign_plan"
  },
  {
    key: "content_creator",
    label: "Content Creator",
    description: "Generate captions, post copy, image prompts, and short-form content packs for campaign execution.",
    goalPlaceholder: "Promote website + automation services with a conversion-focused weekly content pack.",
    previewLabel: "Content pack prompt",
    recommendedJobType: "generate_content_pack"
  },
  {
    key: "video_prompt",
    label: "Video Prompt",
    description: "Generate scripts and scene prompts for Remotion, HeyGen, and short-form video content.",
    goalPlaceholder: "Create a short-form video concept that sells a premium service package.",
    previewLabel: "Video prompt package",
    recommendedJobType: "generate_video_prompt"
  },
  {
    key: "automation_builder",
    label: "Automation Builder",
    description: "Generate structured automation prompts for n8n, Notion, Codex, and internal operators.",
    goalPlaceholder: "Design an automation flow that tracks campaign outputs in Notion and routes jobs through n8n.",
    previewLabel: "Automation prompt package",
    recommendedJobType: "generate_automation_prompt"
  }
];

export function getAgentDefinition(key: AgentTypeValue) {
  return agentRegistry.find((agent) => agent.key === key) ?? null;
}
