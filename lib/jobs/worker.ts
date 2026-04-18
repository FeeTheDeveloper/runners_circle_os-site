import type { AutomationJob } from "@prisma/client";

import { continueAutomationJob } from "@/lib/jobs/execute-job";

export async function processJob(job: AutomationJob) {
  const result = await continueAutomationJob(job.id);

  return {
    ok: result.ok,
    error: result.ok ? undefined : result.message
  };
}
