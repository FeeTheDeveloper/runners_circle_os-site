"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { assertAuthenticated } from "@/lib/auth/session";
import { isDatabaseConfigured, normalizeDatabaseError, prisma } from "@/lib/db";
import type { ActionState } from "@/lib/utils/action-state";
import { getOptionalString, getRequiredString } from "@/lib/utils/form-data";
import {
  createCampaignSchema,
  deleteCampaignSchema,
  updateCampaignSchema
} from "@/lib/validators/campaigns";

function getCampaignInput(formData: FormData) {
  return {
    name: getRequiredString(formData, "name"),
    objective: getRequiredString(formData, "objective"),
    description: getOptionalString(formData, "description"),
    status: getRequiredString(formData, "status") || "DRAFT",
    startDate: getOptionalString(formData, "startDate"),
    endDate: getOptionalString(formData, "endDate")
  };
}

function toCampaignWriteData(input: {
  name: string;
  objective: string;
  description?: string;
  status: "DRAFT" | "PLANNED" | "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";
  startDate?: string;
  endDate?: string;
}) {
  return {
    name: input.name,
    objective: input.objective,
    description: input.description ?? null,
    status: input.status,
    startDate: input.startDate ? new Date(input.startDate) : null,
    endDate: input.endDate ? new Date(input.endDate) : null
  };
}

function normalizeCampaignMutationError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    return "That campaign could not be found. Refresh the page and try again.";
  }

  return normalizeDatabaseError(error);
}

async function ensureCampaignActorId() {
  const user = await assertAuthenticated();

  const record = await prisma.user.upsert({
    where: {
      email: user.email
    },
    update: {
      name: user.name,
      role: user.role,
      status: "ACTIVE",
      lastSeenAt: new Date()
    },
    create: {
      email: user.email,
      name: user.name,
      role: user.role,
      status: "ACTIVE",
      lastSeenAt: new Date()
    },
    select: {
      id: true
    }
  });

  return record.id;
}

function revalidateCampaignSurfaces() {
  revalidatePath("/campaigns");
  revalidatePath("/content");
  revalidatePath("/dashboard");
}

export async function createCampaign(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const input = getCampaignInput(formData);

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
    const createdById = await ensureCampaignActorId();

    await prisma.campaign.create({
      data: {
        ...toCampaignWriteData(parsed.data),
        createdById
      }
    });
  } catch (error) {
    return {
      status: "error",
      message: normalizeCampaignMutationError(error)
    };
  }

  revalidateCampaignSurfaces();

  return {
    status: "success",
    message: "Campaign created successfully."
  };
}

export async function updateCampaign(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await assertAuthenticated();

  const parsed = updateCampaignSchema.safeParse({
    id: getRequiredString(formData, "id"),
    ...getCampaignInput(formData)
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please review the campaign changes and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      status: "error",
      message: "Set DATABASE_URL and run the Prisma setup commands before updating records."
    };
  }

  try {
    await prisma.campaign.update({
      where: {
        id: parsed.data.id
      },
      data: toCampaignWriteData(parsed.data)
    });
  } catch (error) {
    return {
      status: "error",
      message: normalizeCampaignMutationError(error)
    };
  }

  revalidateCampaignSurfaces();

  return {
    status: "success",
    message: "Campaign updated successfully."
  };
}

export async function deleteCampaign(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await assertAuthenticated();

  const parsed = deleteCampaignSchema.safeParse({
    id: getRequiredString(formData, "id")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "A valid campaign id is required before deletion."
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      status: "error",
      message: "Set DATABASE_URL and run the Prisma setup commands before deleting records."
    };
  }

  try {
    await prisma.campaign.delete({
      where: {
        id: parsed.data.id
      }
    });
  } catch (error) {
    return {
      status: "error",
      message: normalizeCampaignMutationError(error)
    };
  }

  revalidateCampaignSurfaces();

  return {
    status: "success",
    message: "Campaign deleted successfully."
  };
}
