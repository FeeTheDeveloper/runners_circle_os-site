"use server";

import { revalidatePath } from "next/cache";

import { assertAuthenticated } from "@/lib/auth/session";
import { executeAutomationJob } from "@/lib/jobs/execute-job";
import type { ActionState } from "@/lib/utils/action-state";
import { getRequiredString } from "@/lib/utils/form-data";
import {
  createAutomationJobSchema,
  updateAutomationJobSchema
} from "@/lib/validators/jobs";

export async function createAutomationJob(input: unknown) {
  await assertAuthenticated();
  const data = createAutomationJobSchema.parse(input);

  revalidatePath("/jobs");
  revalidatePath("/dashboard");

  return {
    ok: true,
    message: "Automation job create placeholder validated. Wire queue persistence in the next phase.",
    data
  };
}

export async function updateAutomationJob(input: unknown) {
  await assertAuthenticated();
  const data = updateAutomationJobSchema.parse(input);

  revalidatePath("/jobs");
  revalidatePath("/dashboard");

  return {
    ok: true,
    message: "Automation job update placeholder validated. Wire queue persistence in the next phase.",
    data
  };
}

export async function runAutomationJob(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await assertAuthenticated();

  const jobId = getRequiredString(formData, "jobId");

  if (!jobId) {
    return {
      status: "error",
      message: "A valid automation job id is required."
    };
  }

  try {
    const result = await executeAutomationJob(jobId);

    revalidatePath("/jobs");
    revalidatePath("/dashboard");

    return {
      status: result.ok ? "success" : "error",
      message: result.message
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Automation job execution failed."
    };
  }
}
