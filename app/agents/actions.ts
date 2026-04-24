"use server";

import { revalidatePath } from "next/cache";

import { buildAgentPrompt } from "@/lib/agents/prompt-builder";
import type { BuiltAgentPrompt } from "@/lib/agents/types";
import { agentTypeToDb } from "@/lib/agents/types";
import { assertAuthenticated } from "@/lib/auth/session";
import { enqueueJobMessage } from "@/lib/aws/queue";
import { isDatabaseConfigured, normalizeDatabaseError, prisma } from "@/lib/db";
import { ensureSessionUserRecord } from "@/lib/db/user-actors";
import { createAgentPromptJob } from "@/lib/jobs/create-job";
import type { ActionState } from "@/lib/utils/action-state";
import { getOptionalId, getOptionalString, getRequiredString } from "@/lib/utils/form-data";
import { approveAgentPromptSchema, generateAgentPromptSchema } from "@/lib/validators/agents";

export type AgentPromptPreviewState = ActionState & {
  preview?: BuiltAgentPrompt | null;
};

export async function generateAgentPromptPreview(
  _previousState: AgentPromptPreviewState,
  formData: FormData
): Promise<AgentPromptPreviewState> {
  await assertAuthenticated();

  const input = {
    agentType: getRequiredString(formData, "agentType"),
    brandSlug: getRequiredString(formData, "brandSlug"),
    goal: getRequiredString(formData, "goal"),
    outputType: getRequiredString(formData, "outputType"),
    campaignId: getOptionalId(formData, "campaignId"),
    platform: getOptionalString(formData, "platform")
  };

  const parsed = generateAgentPromptSchema.safeParse(input);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please review the agent request fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
      preview: null
    };
  }

  const campaignName = parsed.data.campaignId && isDatabaseConfigured()
    ? await prisma.campaign
        .findUnique({
          where: {
            id: parsed.data.campaignId
          },
          select: {
            name: true
          }
        })
        .then((campaign) => campaign?.name ?? null)
    : null;

  const preview = buildAgentPrompt({
    agentType: parsed.data.agentType,
    brandSlug: parsed.data.brandSlug,
    goal: parsed.data.goal,
    outputType: parsed.data.outputType,
    campaignId: parsed.data.campaignId ?? null,
    campaignName,
    platform: parsed.data.platform ?? null
  });

  return {
    status: "success",
    message: "Prompt generated. Review the preview and approve it when you are ready to create the job.",
    preview
  };
}

export async function approveAgentPrompt(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!isDatabaseConfigured()) {
    return {
      status: "error",
      message: "Set DATABASE_URL and run the Prisma setup commands before creating agent prompts."
    };
  }

  await assertAuthenticated();

  const input = {
    agentType: getRequiredString(formData, "agentType"),
    title: getRequiredString(formData, "title"),
    prompt: getRequiredString(formData, "prompt"),
    payloadJson: getRequiredString(formData, "payloadJson"),
    recommendedJobType: getRequiredString(formData, "recommendedJobType"),
    campaignId: getOptionalId(formData, "campaignId"),
    contentId: getOptionalId(formData, "contentId")
  };

  const parsed = approveAgentPromptSchema.safeParse(input);

  if (!parsed.success) {
    return {
      status: "error",
      message: "The generated prompt could not be approved because one or more fields were invalid.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  let payload: BuiltAgentPrompt["payload"];

  try {
    payload = JSON.parse(parsed.data.payloadJson) as BuiltAgentPrompt["payload"];
  } catch {
    return {
      status: "error",
      message: "The generated prompt payload was not valid JSON."
    };
  }

  let automationJobId: string | null = null;

  try {
    const { userId, user } = await ensureSessionUserRecord();

    const createdJob = await prisma.$transaction(async (tx) => {
      const agentPrompt = await tx.agentPrompt.create({
        data: {
          agentType: agentTypeToDb[parsed.data.agentType],
          title: parsed.data.title,
          prompt: parsed.data.prompt,
          payload,
          status: "QUEUED",
          createdById: userId,
          campaignId: parsed.data.campaignId ?? null,
          contentId: parsed.data.contentId ?? null
        }
      });

      return createAgentPromptJob(
        {
          agentPromptId: agentPrompt.id,
          createdById: userId,
          supabaseUserId: user.id,
          recommendedJobType: parsed.data.recommendedJobType
        },
        tx
      );
    });

    automationJobId = createdJob.id;
  } catch (error) {
    return {
      status: "error",
      message: normalizeDatabaseError(error)
    };
  }

  let queueMessage = "Agent prompt approved and automation job queued successfully.";

  if (automationJobId) {
    const queueResult = await enqueueJobMessage(automationJobId);

    if (queueResult.success) {
      queueMessage = "Agent prompt approved, automation job queued, and SQS message sent successfully.";
    } else if (queueResult.skipped) {
      queueMessage =
        "Agent prompt approved and automation job queued. AWS SQS is not configured, so automatic execution was skipped.";
    } else {
      queueMessage = `Agent prompt approved and automation job queued, but SQS enqueue failed: ${queueResult.error}`;
    }
  }

  revalidatePath("/agents");
  revalidatePath("/jobs");
  revalidatePath("/dashboard");

  return {
    status: "success",
    message: queueMessage
  };
}
