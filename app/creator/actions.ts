"use server";

import { revalidatePath } from "next/cache";

import { assertAuthenticated } from "@/lib/auth/session";
import { enqueueJobMessage } from "@/lib/aws/queue";
import { isDatabaseConfigured, normalizeDatabaseError, prisma } from "@/lib/db";
import { ensureSessionUserRecord } from "@/lib/db/user-actors";
import { createCreatorGenerationJob } from "@/lib/jobs/create-job";
import type { ActionState } from "@/lib/utils/action-state";
import { getOptionalId, getOptionalString, getRequiredString } from "@/lib/utils/form-data";
import { createCreatorRequestSchema } from "@/lib/validators/creator";

export async function createCreatorRequest(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const input = {
    type: getRequiredString(formData, "type"),
    templateKey: getRequiredString(formData, "templateKey"),
    platform: getRequiredString(formData, "platform"),
    format: getRequiredString(formData, "format"),
    brandSlug: getRequiredString(formData, "brandSlug"),
    headline: getRequiredString(formData, "headline"),
    body: getRequiredString(formData, "body"),
    cta: getOptionalString(formData, "cta") ?? "",
    campaignId: getOptionalId(formData, "campaignId"),
    accentText: getOptionalString(formData, "accentText")
  };

  const parsed = createCreatorRequestSchema.safeParse(input);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please review the creator request fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      status: "error",
      message: "Set DATABASE_URL and run the Prisma setup commands before creating creator requests."
    };
  }

  const authenticatedUser = await assertAuthenticated();
  let automationJobId: string | null = null;

  try {
    const { userId } = await ensureSessionUserRecord();

    const createdJob = await prisma.$transaction(async (tx) => {
      const request = await tx.creatorRequest.create({
        data: {
          type: parsed.data.type,
          templateKey: parsed.data.templateKey,
          platform: parsed.data.platform,
          format: parsed.data.format,
          brandSlug: parsed.data.brandSlug,
          headline: parsed.data.headline,
          body: parsed.data.body,
          cta: parsed.data.cta,
          status: "QUEUED",
          campaignId: parsed.data.campaignId ?? null,
          createdById: userId,
          payload: {
            accentText: parsed.data.accentText ?? null,
            source: "creator_form",
            submittedAt: new Date().toISOString()
          }
        }
      });

      return createCreatorGenerationJob(
        {
          requestId: request.id,
          createdById: userId,
          supabaseUserId: authenticatedUser.id
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

  let queueMessage = "Creator request saved and automation job queued successfully.";

  if (automationJobId) {
    const queueResult = await enqueueJobMessage(automationJobId);

    if (queueResult.success) {
      queueMessage = "Creator request saved, automation job queued, and SQS message sent successfully.";
    } else if (queueResult.skipped) {
      queueMessage =
        "Creator request saved and automation job queued. AWS SQS is not configured, so automatic execution was skipped.";
    } else {
      queueMessage = `Creator request saved and automation job queued, but SQS enqueue failed: ${queueResult.error}`;
    }
  }

  revalidatePath("/creator");
  revalidatePath("/jobs");
  revalidatePath("/dashboard");

  return {
    status: "success",
    message: queueMessage
  };
}
