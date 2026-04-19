"use server";

import { revalidatePath } from "next/cache";

import { assertAuthenticated } from "@/lib/auth/session";
import { enqueueJobMessage } from "@/lib/aws/queue";
import { getAutomationJobById, markJobQueued } from "@/lib/db/jobs";
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

export async function retryAutomationJob(
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
    const job = await getAutomationJobById(jobId);

    if (!job) {
      return {
        status: "error",
        message: `Automation job ${jobId} could not be found.`
      };
    }

    if (job.status !== "FAILED") {
      return {
        status: "error",
        message: "Only failed automation jobs can be retried."
      };
    }

    await markJobQueued(jobId);

    const queueResult = await enqueueJobMessage(jobId);

    revalidatePath("/jobs");
    revalidatePath("/dashboard");

    if (queueResult.success) {
      return {
        status: "success",
        message: "Automation job re-queued and sent to SQS successfully."
      };
    }

    if (queueResult.skipped) {
      return {
        status: "success",
        message: "Automation job moved back to queued. AWS SQS is not configured, so run it manually when ready."
      };
    }

    return {
      status: "success",
      message: `Automation job moved back to queued, but SQS enqueue failed: ${queueResult.error}`
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Automation job retry failed."
    };
  }
}
