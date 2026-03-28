import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  type Message
} from "@aws-sdk/client-sqs";

import { getSqsClient, getSqsQueueConfig } from "../lib/aws/sqs";
import { getAutomationJobById } from "../lib/db/jobs";
import { prisma } from "../lib/db/prisma";
import { isDatabaseConfigured } from "../lib/db/runtime";
import { processJob } from "../lib/jobs/worker";

const MAX_MESSAGES_PER_CYCLE = 5;
const POLL_DELAY_MS = 2_000;
const WAIT_TIME_SECONDS = 10;

let keepRunning = true;

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function log(message: string, details?: Record<string, unknown>) {
  if (details) {
    console.info(`[sqs-worker] ${message}`, details);
    return;
  }

  console.info(`[sqs-worker] ${message}`);
}

function logError(message: string, details?: Record<string, unknown>) {
  if (details) {
    console.error(`[sqs-worker] ${message}`, details);
    return;
  }

  console.error(`[sqs-worker] ${message}`);
}

function registerShutdownHandlers() {
  const handleShutdown = (signal: NodeJS.Signals) => {
    log(`Received ${signal}. Waiting for the current poll cycle to finish before shutdown.`);
    keepRunning = false;
  };

  process.on("SIGINT", handleShutdown);
  process.on("SIGTERM", handleShutdown);
}

function extractJobId(body: string | undefined) {
  if (!body) {
    return null;
  }

  try {
    const parsed = JSON.parse(body) as { jobId?: unknown };

    if (typeof parsed?.jobId !== "string" || parsed.jobId.length === 0) {
      return null;
    }

    return parsed.jobId;
  } catch {
    return null;
  }
}

async function deleteMessage(queueUrl: string, message: Message) {
  if (!message.ReceiptHandle) {
    logError("Skipping delete because the SQS message has no receipt handle.", {
      messageId: message.MessageId ?? "unknown"
    });
    return;
  }

  const config = getSqsQueueConfig();

  if (!config) {
    throw new Error(
      "AWS SQS is not configured. Set AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_SQS_QUEUE_URL."
    );
  }

  const client = getSqsClient(config);

  await client.send(
    new DeleteMessageCommand({
      QueueUrl: queueUrl,
      ReceiptHandle: message.ReceiptHandle
    })
  );
}

async function handleMessage(queueUrl: string, message: Message) {
  const messageId = message.MessageId ?? "unknown";
  const jobId = extractJobId(message.Body);

  if (!jobId) {
    logError("Received malformed SQS message. Deleting it from the queue.", {
      messageId,
      body: message.Body ?? null
    });
    await deleteMessage(queueUrl, message);
    return;
  }

  const job = await getAutomationJobById(jobId);

  if (!job) {
    log("Received SQS message for a missing job. Deleting it from the queue.", {
      messageId,
      jobId
    });
    await deleteMessage(queueUrl, message);
    return;
  }

  const result = await processJob(job);

  if (!result.ok) {
    logError("Job processing failed. Leaving the SQS message in the queue for retry.", {
      messageId,
      jobId,
      error: result.error ?? "Unknown processing error"
    });
    return;
  }

  await deleteMessage(queueUrl, message);
  log("Processed automation job and deleted the SQS message.", {
    messageId,
    jobId
  });
}

async function pollOnce(queueUrl: string) {
  const config = getSqsQueueConfig();

  if (!config) {
    throw new Error(
      "AWS SQS is not configured. Set AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_SQS_QUEUE_URL."
    );
  }

  const client = getSqsClient(config);

  log("Polling SQS for automation jobs.", {
    waitTimeSeconds: WAIT_TIME_SECONDS,
    maxMessages: MAX_MESSAGES_PER_CYCLE
  });

  const response = await client.send(
    new ReceiveMessageCommand({
      QueueUrl: queueUrl,
      MaxNumberOfMessages: MAX_MESSAGES_PER_CYCLE,
      WaitTimeSeconds: WAIT_TIME_SECONDS
    })
  );

  const messages = response.Messages ?? [];

  if (messages.length === 0) {
    log("No SQS messages received in this poll cycle.");
    return;
  }

  log("Received SQS messages for processing.", {
    count: messages.length
  });

  for (const message of messages) {
    try {
      await handleMessage(queueUrl, message);
    } catch (error) {
      logError("Unhandled error while processing an SQS message.", {
        messageId: message.MessageId ?? "unknown",
        error: error instanceof Error ? error.message : "Unknown SQS worker error"
      });
    }
  }
}

async function main() {
  if (!isDatabaseConfigured()) {
    logError("DATABASE_URL is not configured. Unable to start the SQS worker.");
    process.exitCode = 1;
    return;
  }

  const config = getSqsQueueConfig();

  if (!config) {
    logError(
      "AWS SQS is not configured. Set AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_SQS_QUEUE_URL."
    );
    process.exitCode = 1;
    return;
  }

  registerShutdownHandlers();

  try {
    await prisma.$connect();
  } catch (error) {
    logError(
      error instanceof Error
        ? `Unable to connect to the database for SQS worker execution. ${error.message}`
        : "Unable to connect to the database for SQS worker execution."
    );
    process.exitCode = 1;
    return;
  }

  log("SQS worker started.", {
    queueUrl: config.queueUrl,
    region: config.region
  });

  try {
    while (keepRunning) {
      try {
        await pollOnce(config.queueUrl);
      } catch (error) {
        logError("Poll cycle failed.", {
          error: error instanceof Error ? error.message : "Unknown poll failure"
        });
      }

      if (!keepRunning) {
        break;
      }

      await delay(POLL_DELAY_MS);
    }
  } finally {
    await prisma.$disconnect();
    log("SQS worker stopped.");
  }
}

main().catch((error) => {
  logError(error instanceof Error ? error.message : "SQS worker crashed.");
  process.exitCode = 1;
});
