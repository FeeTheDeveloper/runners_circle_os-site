import type { AgentDefinition, AgentTypeValue } from "@/lib/agents/types";

export const agentRegistry: AgentDefinition[] = [
  {
    type: "campaign_builder",
    label: "Campaign Builder Agent",
    description: "Turns business goals into campaign plans, offer angles, CTA options, and job maps.",
    goalPlaceholder: "Launch a spring offer for high-value service customers and build a 30-day campaign plan.",
    previewLabel: "Campaign plan prompt",
    defaultOutputType: "campaign_plan",
    recommendedJobType: "generate_campaign_plan",
    outputTypes: [
      {
        value: "campaign_plan",
        label: "Campaign Plan",
        description: "Full campaign strategy with offer, audience, and CTA structure."
      },
      {
        value: "launch_brief",
        label: "Launch Brief",
        description: "Concise launch brief with positioning and go-live sequencing."
      },
      {
        value: "job_list",
        label: "Job List",
        description: "Execution-focused checklist with channel and operator tasks."
      }
    ]
  },
  {
    type: "content_creator",
    label: "Content Creator Agent",
    description: "Builds captions, post copy, image prompts, carousel hooks, and short-form content packs.",
    goalPlaceholder: "Create a conversion-focused weekly content pack for a local performance brand.",
    previewLabel: "Content pack prompt",
    defaultOutputType: "content_pack",
    recommendedJobType: "generate_content_pack",
    outputTypes: [
      {
        value: "content_pack",
        label: "Content Pack",
        description: "Captions, hooks, carousels, and short-form scripts bundled together."
      },
      {
        value: "caption_set",
        label: "Caption Set",
        description: "Caption-first output for social and lifecycle publishing."
      },
      {
        value: "carousel_ideas",
        label: "Carousel Ideas",
        description: "Slide-by-slide concept directions with CTA options."
      }
    ]
  },
  {
    type: "video_prompt",
    label: "Video Prompt Agent",
    description: "Creates scripts and scene prompts for Remotion, HeyGen, and short-form video production.",
    goalPlaceholder: "Create a fast-paced short-form video concept that sells a premium service package.",
    previewLabel: "Video prompt package",
    defaultOutputType: "video_script_pack",
    recommendedJobType: "generate_video_prompt",
    outputTypes: [
      {
        value: "video_script_pack",
        label: "Video Script Pack",
        description: "Short-form scripts, hooks, and CTA structures."
      },
      {
        value: "scene_prompt_pack",
        label: "Scene Prompt Pack",
        description: "Scene-by-scene direction for visual and motion production."
      },
      {
        value: "remotion_brief",
        label: "Remotion Brief",
        description: "Structured production brief for internal Remotion builds."
      }
    ]
  },
  {
    type: "automation_builder",
    label: "Automation Builder Agent",
    description: "Generates structured prompts for n8n, Notion, Codex, and operator-ready automation planning.",
    goalPlaceholder: "Design an automation system that tracks campaign outputs in Notion and routes completed jobs to n8n.",
    previewLabel: "Automation blueprint prompt",
    defaultOutputType: "automation_blueprint",
    recommendedJobType: "generate_automation_prompt",
    outputTypes: [
      {
        value: "automation_blueprint",
        label: "Automation Blueprint",
        description: "Cross-system workflow with triggers, states, and handoffs."
      },
      {
        value: "n8n_workflow_prompt",
        label: "n8n Workflow Prompt",
        description: "n8n-first instruction set for workflow implementation."
      },
      {
        value: "notion_ops_prompt",
        label: "Notion Ops Prompt",
        description: "Structured instructions for Notion databases, views, and tracking."
      }
    ]
  }
];

export function getAgentDefinition(type: AgentTypeValue) {
  return agentRegistry.find((agent) => agent.type === type) ?? null;
}

export function listOutputTypesForAgent(type: AgentTypeValue) {
  return getAgentDefinition(type)?.outputTypes ?? [];
}
