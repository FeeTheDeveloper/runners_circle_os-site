import { getAutomationJobById, getRunningJobs } from "../lib/db/jobs";
import { prisma } from "../lib/db/prisma";
import { isDatabaseConfigured } from "../lib/db/runtime";
import { processJob } from "../lib/jobs/worker";

function getRequestedJobId() {
  const directId = process.argv[2];

  if (directId && !directId.startsWith("--")) {
    return directId;
  }

  const flagIndex = process.argv.findIndex((argument) => argument === "--job");

  if (flagIndex === -1) {
    return null;
  }

  return process.argv[flagIndex + 1] ?? null;
}

async function main() {
  if (!isDatabaseConfigured()) {
    console.error("DATABASE_URL is not configured. Unable to run the job worker.");
    process.exitCode = 1;
    return;
  }

  try {
    await prisma.$connect();
  } catch (error) {
    console.error(
      error instanceof Error
        ? `Unable to connect to the database for worker execution. ${error.message}`
        : "Unable to connect to the database for worker execution."
    );
    process.exitCode = 1;
    return;
  }

  try {
    const jobId = getRequestedJobId();

    if (jobId) {
      const job = await getAutomationJobById(jobId);

      if (!job) {
        console.error(`Automation job ${jobId} could not be found.`);
        process.exitCode = 1;
        return;
      }

      const result = await processJob(job);

      if (!result.ok) {
        console.error(result.error ?? `Automation job ${job.id} failed.`);
        process.exitCode = 1;
        return;
      }

      console.info(`Processed automation job ${job.id}.`);
      return;
    }

    const jobs = await getRunningJobs();

    if (jobs.length === 0) {
      console.info("No RUNNING automation jobs are available for processing.");
      return;
    }

    let processedCount = 0;
    let failedCount = 0;

    for (const job of jobs) {
      const result = await processJob(job);

      if (result.ok) {
        processedCount += 1;
        continue;
      }

      failedCount += 1;
      console.error(result.error ?? `Automation job ${job.id} failed.`);
    }

    console.info(
      `Worker run completed. ${processedCount} job${processedCount === 1 ? "" : "s"} succeeded, ${failedCount} failed.`
    );

    if (failedCount > 0) {
      process.exitCode = 1;
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Worker run failed.");
  process.exitCode = 1;
});
