"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

import { isDatabaseConfigured, normalizeDatabaseError, prisma } from "@/lib/db";
import { ensureSessionUserRecord } from "@/lib/db/user-actors";
import type { ActionState } from "@/lib/utils/action-state";
import { getOptionalString, getRequiredString, getTagList } from "@/lib/utils/form-data";
import {
  createAudienceSegmentSchema,
  updateAudienceSegmentSchema
} from "@/lib/validators/audiences";

export async function createAudienceSegment(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const input = {
    name: getRequiredString(formData, "name"),
    description: getOptionalString(formData, "description"),
    marketLane: getOptionalString(formData, "marketLane"),
    tags: getTagList(formData, "tags")
  };

  const parsed = createAudienceSegmentSchema.safeParse(input);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please review the audience segment fields and try again.",
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
    const { userId } = await ensureSessionUserRecord();

    await prisma.audienceSegment.create({
      data: {
        ...parsed.data,
        description: parsed.data.description ?? null,
        marketLane: parsed.data.marketLane ?? null,
        createdById: userId
      }
    });
  } catch (error) {
    return {
      status: "error",
      message: normalizeDatabaseError(error)
    };
  }

  revalidatePath("/audiences");
  revalidatePath("/leads");
  revalidatePath("/dashboard");

  return {
    status: "success",
    message: "Audience segment created successfully."
  };
}

export async function updateAudienceSegment(input: unknown) {
  try {
    const data = updateAudienceSegmentSchema.parse(input);

    return {
      ok: true,
      message: "Audience segment update placeholder validated for the next phase.",
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
