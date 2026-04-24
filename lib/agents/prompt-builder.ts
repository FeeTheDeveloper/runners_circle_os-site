import { formatTokenLabel } from "@/lib/utils/format";

import type { AgentPromptBuilderInput, BuiltAgentPrompt, OutputPresetPayloadValue } from "@/lib/agents/types";

function trimGoal(goal: string) {
  return goal.replace(/\s+/g, " ").trim();
}

function buildTitle(prefix: string, goal: string) {
  const trimmed = trimGoal(goal);
  const shortened = trimmed.length > 72 ? `${trimmed.slice(0, 69).trimEnd()}...` : trimmed;

  return `${prefix} | ${shortened}`;
}

function getNumberPayloadValue(payload: Record<string, OutputPresetPayloadValue>, key: string) {
  const value = payload[key];

  return typeof value === "number" ? value : null;
}

function getBooleanPayloadValue(payload: Record<string, OutputPresetPayloadValue>, key: string) {
  const value = payload[key];

  return typeof value === "boolean" ? value : null;
}

function buildSharedPayload(
  input: AgentPromptBuilderInput,
  sections: string[],
  recommendedJobType: BuiltAgentPrompt["recommendedJobType"]
) {
  const outputConfig = input.outputPreset.payload;

  return {
    agentType: input.agent.key,
    businessSlug: input.business.slug,
    businessLabel: input.business.label,
    businessDescription: input.business.description,
    brandSlug: input.business.slug,
    goal: trimGoal(input.goal),
    outputPresetKey: input.outputPreset.key,
    outputLabel: input.outputPreset.label,
    outputType: input.outputPreset.key,
    outputConfig,
    campaignId: input.campaignId ?? null,
    campaignName: input.campaignName ?? null,
    platform: input.platform ?? null,
    contentId: input.contentId ?? null,
    contentTitle: input.contentTitle ?? null,
    sections,
    defaultCtas: input.business.defaultCtas,
    recommendedJobType,
    postCount: getNumberPayloadValue(outputConfig, "postCount"),
    videoScriptCount: getNumberPayloadValue(outputConfig, "videoScriptCount"),
    includeCaptions: getBooleanPayloadValue(outputConfig, "includeCaptions"),
    includeImagePrompts: getBooleanPayloadValue(outputConfig, "includeImagePrompts"),
    includeCtas: getBooleanPayloadValue(outputConfig, "includeCtas")
  } satisfies BuiltAgentPrompt["payload"];
}

export function buildCampaignPrompt(input: AgentPromptBuilderInput): BuiltAgentPrompt {
  const sections = ["Offer", "Audience", "Content ideas", "CTA options", "Execution jobs"];
  const platformLine = input.platform ? `Prioritize ${formatTokenLabel(input.platform)} distribution.` : "Include multi-channel distribution guidance.";
  const campaignLine = input.campaignName
    ? `Tie the plan to campaign: ${input.campaignName}.`
    : "No campaign is attached yet, so propose a flexible campaign frame.";

  return {
    title: buildTitle(`${input.business.label} ${input.agent.label}`, input.goal),
    prompt: [
      `You are the ${input.agent.label} for ${input.business.label}.`,
      `Goal: ${trimGoal(input.goal)}`,
      `Output preset: ${input.outputPreset.label}.`,
      campaignLine,
      platformLine,
      "Generate a campaign plan with offer, audience, content ideas, CTA options, and an execution-ready job list.",
      "Structure the response with clear sections and bullet-ready outputs for operators.",
      `Business context: ${input.business.description}`
    ].join("\n"),
    payload: buildSharedPayload(input, sections, "generate_campaign_plan"),
    recommendedJobType: "generate_campaign_plan"
  };
}

function buildFeeTheDeveloperContentPackPrompt(input: AgentPromptBuilderInput): BuiltAgentPrompt {
  const sections = ["Posts", "Video scripts", "Captions", "Image prompts", "CTA options"];
  const platformLine = input.platform
    ? `Optimize all outputs for ${formatTokenLabel(input.platform)} while keeping them reusable across other short-form channels.`
    : "Keep the outputs platform-ready for social distribution while making them reusable across organic and sales-driven channels.";
  const campaignLine = input.campaignName
    ? `Align the deliverables to campaign: ${input.campaignName}.`
    : "Generate the pack so it can attach cleanly to a future campaign if one is added later.";
  const ctaLine =
    input.business.defaultCtas.length > 0
      ? `Use CTA options aligned to this brand: ${input.business.defaultCtas.join("; ")}.`
      : "Include CTA options that map to awareness, engagement, and conversion outcomes.";

  return {
    title: buildTitle(`${input.business.label} ${input.agent.label}`, input.goal),
    prompt: [
      `You are the ${input.agent.label} for ${input.business.label}.`,
      `Goal: ${trimGoal(input.goal)}`,
      `Output preset: ${input.outputPreset.label}.`,
      campaignLine,
      platformLine,
      "Generate exactly 5 social posts and 2 short video scripts.",
      "Include platform-ready captions for every post and every video script.",
      "Include image prompt ideas for the post assets.",
      ctaLine,
      "Align the brand tone to Fee The Developer: premium, direct, technically fluent, conversion-minded, and rooted in website design, automation, AI systems, and software development services.",
      "Return the final output in JSON or clearly labeled markdown sections so it can move directly into downstream automation.",
      `Business context: ${input.business.description}`
    ].join("\n"),
    payload: buildSharedPayload(input, sections, "generate_content_pack"),
    recommendedJobType: "generate_content_pack"
  };
}

export function buildContentPrompt(input: AgentPromptBuilderInput): BuiltAgentPrompt {
  if (input.business.slug === "fee-the-developer" && input.outputPreset.key === "content_pack_5_posts_2_videos") {
    return buildFeeTheDeveloperContentPackPrompt(input);
  }

  const sections = ["Captions", "Post copy", "Image prompts", "Carousel ideas", "Short video scripts"];
  const platformLine = input.platform ? `Optimize the pack for ${formatTokenLabel(input.platform)}.` : "Include platform-flexible versions where possible.";
  const campaignLine = input.campaignName
    ? `Align the outputs to campaign: ${input.campaignName}.`
    : "Generate content that can attach to a future campaign if needed.";
  const ctaLine =
    input.business.defaultCtas.length > 0
      ? `Include CTA options using these priorities: ${input.business.defaultCtas.join("; ")}.`
      : "Include CTA options aligned to awareness, consideration, and conversion.";

  return {
    title: buildTitle(`${input.business.label} ${input.agent.label}`, input.goal),
    prompt: [
      `You are the ${input.agent.label} for ${input.business.label}.`,
      `Goal: ${trimGoal(input.goal)}`,
      `Output preset: ${input.outputPreset.label}.`,
      campaignLine,
      platformLine,
      "Generate captions, post copy, image prompts, carousel ideas, and short video scripts.",
      ctaLine,
      "Keep the outputs commercially sharp, operator-ready, and easy to hand to design or publishing workflows.",
      "Return the output in JSON or clearly labeled markdown sections.",
      `Business context: ${input.business.description}`
    ].join("\n"),
    payload: buildSharedPayload(input, sections, "generate_content_pack"),
    recommendedJobType: "generate_content_pack"
  };
}

export function buildVideoPrompt(input: AgentPromptBuilderInput): BuiltAgentPrompt {
  const sections = ["Hook", "Script", "Scene prompts", "Remotion notes", "HeyGen notes"];
  const platformLine = input.platform
    ? `Design the output for ${formatTokenLabel(input.platform)} short-form use.`
    : "Design the output for short-form video distribution.";
  const campaignLine = input.campaignName
    ? `Reference campaign: ${input.campaignName}.`
    : "Keep the script adaptable to campaign packaging.";

  return {
    title: buildTitle(`${input.business.label} ${input.agent.label}`, input.goal),
    prompt: [
      `You are the ${input.agent.label} for ${input.business.label}.`,
      `Goal: ${trimGoal(input.goal)}`,
      `Output preset: ${input.outputPreset.label}.`,
      campaignLine,
      platformLine,
      "Generate scripts and scene prompts for Remotion, HeyGen, and short-form video content.",
      "Return hooks, beats, transitions, visual motifs, and CTA moments in a production-friendly format.",
      `Business context: ${input.business.description}`
    ].join("\n"),
    payload: buildSharedPayload(input, sections, "generate_video_prompt"),
    recommendedJobType: "generate_video_prompt"
  };
}

export function buildAutomationPrompt(input: AgentPromptBuilderInput): BuiltAgentPrompt {
  const sections = ["Workflow summary", "n8n instructions", "Notion structure", "Codex tasks", "Operator QA"];
  const campaignLine = input.campaignName
    ? `Design the automation around campaign: ${input.campaignName}.`
    : "Design the automation so it can be reused across campaigns.";
  const platformLine = input.platform
    ? `Include any platform-specific routing needed for ${formatTokenLabel(input.platform)}.`
    : "Keep the automation adaptable across publishing and ops systems.";

  return {
    title: buildTitle(`${input.business.label} ${input.agent.label}`, input.goal),
    prompt: [
      `You are the ${input.agent.label} for ${input.business.label}.`,
      `Goal: ${trimGoal(input.goal)}`,
      `Output preset: ${input.outputPreset.label}.`,
      campaignLine,
      platformLine,
      "Generate n8n, Notion, and Codex prompts using structured instructions.",
      "Return implementation-ready workflow logic, database states, prompt blocks, and QA checkpoints.",
      `Business context: ${input.business.description}`
    ].join("\n"),
    payload: buildSharedPayload(input, sections, "generate_automation_prompt"),
    recommendedJobType: "generate_automation_prompt"
  };
}

export function buildAgentPrompt(input: AgentPromptBuilderInput): BuiltAgentPrompt {
  switch (input.agent.key) {
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
