import "server-only";

import { sendToQueue } from "@/lib/aws/queue";
import { getQueuedJobs, markJobFailed, markJobRunning } from "@/lib/db/jobs";
import { processJob } from "@/lib/jobs/worker";

export async function dispatchQueuedJobs() {
  const jobs = await getQueuedJobs();
  let dispatchedCount = 0;

  for (const job of jobs) {
    const runningJob = await markJobRunning(job.id);
    const queueResult = await sendToQueue(runningJob);

    if (!queueResult.success) {
      await markJobFailed(job.id, queueResult.error ?? "Queue dispatch failed.");
      continue;
    }

    dispatchedCount += 1;

    // Mock queue mode: process immediately until SQS + Lambda are wired in.
    await processJob(runningJob);
  }

  return dispatchedCount;
}
