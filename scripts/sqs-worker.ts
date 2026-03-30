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

type QueueMessageBody = {
  jobId: string;
  type: string;
  payload: unknown;
  scheduledFor: string | null;
};

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

function parseMessageBody(
  body: string | undefined
):
  | {
      ok: true;
      value: QueueMessageBody;
    }
  | {
      ok: false;
      error: string;
    } {
  if (!body) {
    return {
      ok: false,
      error: "Message body is empty."
    };
  }

  try {
    const parsed = JSON.parse(body) as Record<string, unknown>;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {
        ok: false,
        error: "Message body must be a JSON object."
      };
    }

    const { jobId, type, payload, scheduledFor } = parsed;

    if (typeof jobId !== "string" || jobId.length === 0) {
      return {
        ok: false,
        error: "Message body must include a non-empty jobId string."
      };
    }

    if (typeof type !== "string" || type.length === 0) {
      return {
        ok: false,
        error: "Message body must include a non-empty type string."
      };
    }

    if (!Object.hasOwn(parsed, "payload")) {
      return {
        ok: false,
        error: "Message body must include a payload field."
      };
    }

    if (scheduledFor !== null && typeof scheduledFor !== "string") {
      return {
        ok: false,
        error: "Message body scheduledFor must be a string or null."
      };
    }

    return {
      ok: true,
      value: {
        jobId,
        type,
        payload,
        scheduledFor
      }
    };
  } catch {
    return {
      ok: false,
      error: "Message body is not valid JSON."
    };
  }
}

async function deleteMessage(
  client: ReturnType<typeof getSqsClient>,
  queueUrl: string,
  message: Message
) {
  if (!message.ReceiptHandle) {
    logError("Skipping delete because the SQS message has no receipt handle.", {
      messageId: message.MessageId ?? "unknown"
    });
    return;
  }

  await client.send(
    new DeleteMessageCommand({
      QueueUrl: queueUrl,
      ReceiptHandle: message.ReceiptHandle
    })
  );
}

async function handleMessage(
  client: ReturnType<typeof getSqsClient>,
  queueUrl: string,
  message: Message
) {
  const messageId = message.MessageId ?? "unknown";
  const parsedBody = parseMessageBody(message.Body);

  if (!parsedBody.ok) {
    logError("Received malformed SQS message. Deleting it from the queue.", {
      messageId,
      error: parsedBody.error,
      body: message.Body ?? null
    });
    await deleteMessage(client, queueUrl, message);
    return;
  }

  const { jobId, scheduledFor, type } = parsedBody.value;
  const job = await getAutomationJobById(jobId);

  if (!job) {
    log("Received SQS message for a missing job. Deleting it from the queue.", {
      messageId,
      jobId,
      type,
      scheduledFor
    });
    await deleteMessage(client, queueUrl, message);
    return;
  }

  log("Processing automation job from SQS.", {
    messageId,
    jobId,
    type,
    scheduledFor,
    status: job.status
  });

  const result = await processJob(job);

  if (!result.ok) {
    logError("Job processing failed. Leaving the SQS message in the queue for retry.", {
      messageId,
      jobId,
      type,
      error: result.error ?? "Unknown processing error"
    });
    return;
  }

  await deleteMessage(client, queueUrl, message);
  log("Processed automation job and deleted the SQS message.", {
    messageId,
    jobId,
    type
  });
}

async function pollOnce(client: ReturnType<typeof getSqsClient>, queueUrl: string) {
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
      await handleMessage(client, queueUrl, message);
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

  const client = getSqsClient(config);

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
        await pollOnce(client, config.queueUrl);
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
