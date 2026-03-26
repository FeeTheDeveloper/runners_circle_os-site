"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

import { assertAuthenticated } from "@/lib/auth/session";
import { isDatabaseConfigured, normalizeDatabaseError, prisma } from "@/lib/db";
import type { ActionState } from "@/lib/utils/action-state";
import {
  getOptionalId,
  getOptionalString,
  getRequiredString,
  getTagList
} from "@/lib/utils/form-data";
import { createLeadSchema, updateLeadSchema } from "@/lib/validators/leads";

export async function createLead(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await assertAuthenticated();

  const input = {
    firstName: getRequiredString(formData, "firstName"),
    lastName: getRequiredString(formData, "lastName"),
    email: getRequiredString(formData, "email"),
    company: getOptionalString(formData, "company"),
    source: getOptionalString(formData, "source"),
    status: getOptionalString(formData, "status") ?? "NEW",
    tags: getTagList(formData, "tags"),
    notes: getOptionalString(formData, "notes"),
    segmentId: getOptionalId(formData, "segmentId")
  };

  const parsed = createLeadSchema.safeParse(input);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please review the lead fields and try again.",
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
    await prisma.lead.create({
      data: {
        ...parsed.data,
        company: parsed.data.company ?? null,
        source: parsed.data.source ?? null,
        notes: parsed.data.notes ?? null,
        segmentId: parsed.data.segmentId ?? null
      }
    });
  } catch (error) {
    return {
      status: "error",
      message: normalizeDatabaseError(error)
    };
  }

  revalidatePath("/leads");
  revalidatePath("/audiences");
  revalidatePath("/dashboard");

  return {
    status: "success",
    message: "Lead created successfully."
  };
}

export async function updateLead(input: unknown) {
  try {
    const data = updateLeadSchema.parse(input);

    return {
      ok: true,
      message: "Lead update placeholder validated for the next implementation phase.",
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
