import { getBrandKit } from "@/lib/creator/brand-kits";
import { formatTokenLabel } from "@/lib/utils/format";

import type { AgentPromptBuilderInput, BuiltAgentPrompt } from "@/lib/agents/types";

function trimGoal(goal: string) {
  return goal.replace(/\s+/g, " ").trim();
}

function buildTitle(prefix: string, goal: string) {
  const trimmed = trimGoal(goal);
  const shortened = trimmed.length > 72 ? `${trimmed.slice(0, 69).trimEnd()}...` : trimmed;

  return `${prefix} | ${shortened}`;
}

function buildSharedPayload(input: AgentPromptBuilderInput, sections: string[], recommendedJobType: BuiltAgentPrompt["recommendedJobType"]) {
  return {
    agentType: input.agentType,
    brandSlug: input.brandSlug,
    goal: trimGoal(input.goal),
    outputType: input.outputType,
    campaignId: input.campaignId ?? null,
    campaignName: input.campaignName ?? null,
    platform: input.platform ?? null,
    contentId: input.contentId ?? null,
    contentTitle: input.contentTitle ?? null,
    sections,
    recommendedJobType
  } satisfies BuiltAgentPrompt["payload"];
}

export function buildCampaignPrompt(input: AgentPromptBuilderInput): BuiltAgentPrompt {
  const brand = getBrandKit(input.brandSlug);
  const sections = ["Offer", "Audience", "Content ideas", "CTA options", "Execution jobs"];
  const platformLine = input.platform ? `Prioritize ${formatTokenLabel(input.platform)} distribution.` : "Include multi-channel distribution guidance.";
  const campaignLine = input.campaignName ? `Tie the plan to campaign: ${input.campaignName}.` : "No campaign is attached yet, so propose a flexible campaign frame.";
  const outputLabel = formatTokenLabel(input.outputType);

  return {
    title: buildTitle(`${brand.label} Campaign Builder`, input.goal),
    prompt: [
      `You are the Campaign Builder Agent for ${brand.label}.`,
      `Goal: ${trimGoal(input.goal)}`,
      `Output type: ${outputLabel}.`,
      campaignLine,
      platformLine,
      "Generate a campaign plan with offer, audience, content ideas, CTA options, and an execution-ready job list.",
      "Structure the response with clear sections and bullet-ready outputs for operators.",
      `Brand context: ${brand.description}`
    ].join("\n"),
    payload: buildSharedPayload(input, sections, "generate_campaign_plan"),
    recommendedJobType: "generate_campaign_plan"
  };
}

export function buildContentPrompt(input: AgentPromptBuilderInput): BuiltAgentPrompt {
  const brand = getBrandKit(input.brandSlug);
  const sections = ["Captions", "Post copy", "Image prompts", "Carousel ideas", "Short video scripts"];
  const platformLine = input.platform ? `Optimize the pack for ${formatTokenLabel(input.platform)}.` : "Include platform-flexible versions where possible.";
  const campaignLine = input.campaignName
    ? `Align the outputs to campaign: ${input.campaignName}.`
    : "Generate content that can attach to a future campaign if needed.";

  return {
    title: buildTitle(`${brand.label} Content Creator`, input.goal),
    prompt: [
      `You are the Content Creator Agent for ${brand.label}.`,
      `Goal: ${trimGoal(input.goal)}`,
      `Output type: ${formatTokenLabel(input.outputType)}.`,
      campaignLine,
      platformLine,
      "Generate captions, post copy, image prompts, carousel ideas, and short video scripts.",
      "Keep the outputs commercially sharp, operator-ready, and easy to hand to design or publishing workflows.",
      `Brand context: ${brand.description}`
    ].join("\n"),
    payload: buildSharedPayload(input, sections, "generate_content_pack"),
    recommendedJobType: "generate_content_pack"
  };
}

export function buildVideoPrompt(input: AgentPromptBuilderInput): BuiltAgentPrompt {
  const brand = getBrandKit(input.brandSlug);
  const sections = ["Hook", "Script", "Scene prompts", "Remotion notes", "HeyGen notes"];
  const platformLine = input.platform
    ? `Design the output for ${formatTokenLabel(input.platform)} short-form use.`
    : "Design the output for short-form video distribution.";
  const campaignLine = input.campaignName
    ? `Reference campaign: ${input.campaignName}.`
    : "Keep the script adaptable to campaign packaging.";

  return {
    title: buildTitle(`${brand.label} Video Prompt`, input.goal),
    prompt: [
      `You are the Video Prompt Agent for ${brand.label}.`,
      `Goal: ${trimGoal(input.goal)}`,
      `Output type: ${formatTokenLabel(input.outputType)}.`,
      campaignLine,
      platformLine,
      "Generate scripts and scene prompts for Remotion, HeyGen, and short-form video content.",
      "Return hooks, beats, transitions, visual motifs, and CTA moments in a production-friendly format.",
      `Brand context: ${brand.description}`
    ].join("\n"),
    payload: buildSharedPayload(input, sections, "generate_video_prompt"),
    recommendedJobType: "generate_video_prompt"
  };
}

export function buildAutomationPrompt(input: AgentPromptBuilderInput): BuiltAgentPrompt {
  const brand = getBrandKit(input.brandSlug);
  const sections = ["Workflow summary", "n8n instructions", "Notion structure", "Codex tasks", "Operator QA"];
  const campaignLine = input.campaignName
    ? `Design the automation around campaign: ${input.campaignName}.`
    : "Design the automation so it can be reused across campaigns.";
  const platformLine = input.platform
    ? `Include any platform-specific routing needed for ${formatTokenLabel(input.platform)}.`
    : "Keep the automation adaptable across publishing and ops systems.";

  return {
    title: buildTitle(`${brand.label} Automation Builder`, input.goal),
    prompt: [
      `You are the Automation Builder Agent for ${brand.label}.`,
      `Goal: ${trimGoal(input.goal)}`,
      `Output type: ${formatTokenLabel(input.outputType)}.`,
      campaignLine,
      platformLine,
      "Generate n8n, Notion, and Codex prompts using structured instructions.",
      "Return implementation-ready workflow logic, database states, prompt blocks, and QA checkpoints.",
      `Brand context: ${brand.description}`
    ].join("\n"),
    payload: buildSharedPayload(input, sections, "generate_automation_prompt"),
    recommendedJobType: "generate_automation_prompt"
  };
}

export function buildAgentPrompt(input: AgentPromptBuilderInput): BuiltAgentPrompt {
  switch (input.agentType) {
    case "campaign_builder":
      return buildCampaignPrompt(input);
    case "content_creator":
      return buildContentPrompt(input);
    case "video_prompt":
      return buildVideoPrompt(input);
    case "automation_builder":
      return buildAutomationPrompt(input);
  }
}
