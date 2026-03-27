import "server-only";

import { sendToQueue } from "@/lib/aws/queue";
import { getQueuedJobs, markJobFailed, markJobRunning } from "@/lib/db/jobs";

export async function dispatchQueuedJobs() {
  const jobs = await getQueuedJobs();
  let dispatchedCount = 0;

  for (const job of jobs) {
    let runningJob;

    try {
      runningJob = await markJobRunning(job.id);
    } catch {
      continue;
    }

    const queueResult = await sendToQueue(runningJob);

    if (!queueResult.success) {
      await markJobFailed(
        job.id,
        `SQS dispatch failed for ${job.type}: ${queueResult.error}`
      );
      continue;
    }

    dispatchedCount += 1;
  }

  return dispatchedCount;
}
