"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

import { assertAuthenticated } from "@/lib/auth/session";
import { enqueueJobMessage } from "@/lib/aws/queue";
import { isDatabaseConfigured, normalizeDatabaseError, prisma } from "@/lib/db";
import { ensureSessionUserRecord } from "@/lib/db/user-actors";
import { createContentPublishJob } from "@/lib/jobs/create-job";
import type { ActionState } from "@/lib/utils/action-state";
import { getOptionalId, getOptionalString, getRequiredString } from "@/lib/utils/form-data";
import { createContentItemSchema, updateContentItemSchema } from "@/lib/validators/content";

export async function createContentItem(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const input = {
    title: getRequiredString(formData, "title"),
    platform: getRequiredString(formData, "platform"),
    format: getRequiredString(formData, "format"),
    copy: getRequiredString(formData, "copy"),
    mediaUrl: getOptionalString(formData, "mediaUrl"),
    status: getOptionalString(formData, "status") ?? "DRAFT",
    scheduledFor: getOptionalString(formData, "scheduledFor"),
    campaignId: getOptionalId(formData, "campaignId")
  };

  const parsed = createContentItemSchema.safeParse(input);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please review the content item fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      status: "error",
      message: "Set DATABASE_URL and run the Prisma setup commands before creating records."
    };
  }

  const authenticatedUser = await assertAuthenticated();
  let automationJobId: string | null = null;

  try {
    const { userId } = await ensureSessionUserRecord();

    const createdJob = await prisma.$transaction(async (tx) => {
      const contentItem = await tx.contentItem.create({
        data: {
          title: parsed.data.title,
          platform: parsed.data.platform,
          format: parsed.data.format,
          copy: parsed.data.copy,
          mediaUrl: parsed.data.mediaUrl ?? null,
          status: parsed.data.status,
          scheduledFor: parsed.data.scheduledFor ?? null,
          campaignId: parsed.data.campaignId ?? null,
          createdById: userId
        }
      });

      return createContentPublishJob(
        {
          contentItemId: contentItem.id,
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

  let queueMessage = "Content item created and automation job queued successfully.";

  if (automationJobId) {
    const queueResult = await enqueueJobMessage(automationJobId);

    if (queueResult.success) {
      queueMessage = "Content item created, automation job queued, and SQS message sent successfully.";
    } else if (queueResult.skipped) {
      queueMessage =
        "Content item created and automation job queued. AWS SQS is not configured, so automatic execution was skipped.";
    } else {
      queueMessage = `Content item created and automation job queued, but SQS enqueue failed: ${queueResult.error}`;
    }
  }

  revalidatePath("/content");
  revalidatePath("/campaigns");
  revalidatePath("/dashboard");
  revalidatePath("/jobs");

  return {
    status: "success",
    message: queueMessage
  };
}

export async function updateContentItem(input: unknown) {
  try {
    const data = updateContentItemSchema.parse(input);

    return {
      ok: true,
      message: "Content update placeholder validated for the next implementation phase.",
      data
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ok: false,
        message: error.message
      };
    }

    throw error;
  }
}
