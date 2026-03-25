"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

import { assertAuthenticated } from "@/lib/auth/session";
import { isDatabaseConfigured, normalizeDatabaseError, prisma } from "@/lib/db";
import type { ActionState } from "@/lib/utils/action-state";
import { getOptionalString, getRequiredString } from "@/lib/utils/form-data";
import { createCampaignSchema, updateCampaignSchema } from "@/lib/validators/campaigns";

export async function createCampaign(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await assertAuthenticated();

  const input = {
    name: getRequiredString(formData, "name"),
    objective: getRequiredString(formData, "objective"),
    description: getOptionalString(formData, "description"),
    status: getRequiredString(formData, "status") || "DRAFT",
    startDate: getOptionalString(formData, "startDate"),
    endDate: getOptionalString(formData, "endDate")
  };

  const parsed = createCampaignSchema.safeParse(input);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please review the campaign fields and try again.",
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
    await prisma.campaign.create({
      data: {
        name: parsed.data.name,
        objective: parsed.data.objective,
        description: parsed.data.description ?? null,
        status: parsed.data.status,
        startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null
      }
    });
  } catch (error) {
    return {
      status: "error",
      message: normalizeDatabaseError(error)
    };
  }

  revalidatePath("/campaigns");
  revalidatePath("/content");
  revalidatePath("/dashboard");

  return {
    status: "success",
    message: "Campaign created successfully."
  };
}

export async function updateCampaign(input: unknown) {
  try {
    const data = updateCampaignSchema.parse(input);

    return {
      ok: true,
      message: "Campaign update placeholder validated for the next implementation phase.",
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
