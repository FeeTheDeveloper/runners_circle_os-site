"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

import { assertAuthenticated } from "@/lib/auth/session";
import { isDatabaseConfigured, normalizeDatabaseError, prisma } from "@/lib/db";
import type { ActionState } from "@/lib/utils/action-state";
import { getOptionalId, getOptionalString, getRequiredString } from "@/lib/utils/form-data";
import { createContentItemSchema, updateContentItemSchema } from "@/lib/validators/content";

export async function createContentItem(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await assertAuthenticated();

  const input = {
    title: getRequiredString(formData, "title"),
    platform: getRequiredString(formData, "platform"),
    format: getRequiredString(formData, "format"),
    copy: getRequiredString(formData, "copy"),
    mediaUrl: getOptionalString(formData, "mediaUrl"),
    status: getRequiredString(formData, "status") || "DRAFT",
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

  try {
    await prisma.contentItem.create({
      data: {
        title: parsed.data.title,
        platform: parsed.data.platform,
        format: parsed.data.format,
        copy: parsed.data.copy,
        mediaUrl: parsed.data.mediaUrl || null,
        status: parsed.data.status,
        scheduledFor: parsed.data.scheduledFor ? new Date(parsed.data.scheduledFor) : null,
        campaignId: parsed.data.campaignId ?? null
      }
    });
  } catch (error) {
    return {
      status: "error",
      message: normalizeDatabaseError(error)
    };
  }

  revalidatePath("/content");
  revalidatePath("/dashboard");

  return {
    status: "success",
    message: "Content item created successfully."
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
