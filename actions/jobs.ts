"use server";

import { revalidatePath } from "next/cache";

import { assertAuthenticated } from "@/lib/auth/session";
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
