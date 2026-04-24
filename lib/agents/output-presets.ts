import type { AgentTypeValue, OutputPreset } from "@/lib/agents/types";

export const outputPresets: OutputPreset[] = [
  {
    key: "content_pack_5_posts_2_videos",
    label: "5 posts + 2 video scripts",
    agentTypes: ["content_creator"],
    payload: {
      postCount: 5,
      videoScriptCount: 2,
      includeCaptions: true,
      includeImagePrompts: true,
      includeCtas: true
    }
  },
  {
    key: "campaign_plan_basic",
    label: "Campaign plan",
    agentTypes: ["campaign_builder"],
    payload: {}
  },
  {
    key: "video_prompt_pack",
    label: "Video prompt pack",
    agentTypes: ["video_prompt"],
    payload: {}
  },
  {
    key: "automation_prompt_pack",
    label: "Automation prompt pack",
    agentTypes: ["automation_builder"],
    payload: {}
  }
];

export function getOutputPreset(key: string) {
  return outputPresets.find((preset) => preset.key === key) ?? null;
}

export function listOutputPresetsForAgent(agentType: AgentTypeValue) {
  return outputPresets.filter((preset) => preset.agentTypes.includes(agentType));
}

export function getDefaultOutputPresetForAgent(agentType: AgentTypeValue) {
  return listOutputPresetsForAgent(agentType)[0] ?? null;
}
