import "server-only";

import type { AutomationJob } from "@prisma/client";
import { SendMessageCommand } from "@aws-sdk/client-sqs";

import { getSqsClient, getSqsQueueConfig } from "@/lib/aws/sqs";

export type QueueDispatchResult =
  | {
      success: true;
      skipped?: false;
      messageId?: string;
    }
  | {
      success: false;
      skipped?: boolean;
      error: string;
    };

function logQueueInfo(message: string, details?: Record<string, unknown>) {
  if (details) {
    console.info(`[sqs-queue] ${message}`, details);
    return;
  }

  console.info(`[sqs-queue] ${message}`);
}

function logQueueError(message: string, details?: Record<string, unknown>) {
  if (details) {
    console.error(`[sqs-queue] ${message}`, details);
    return;
  }

  console.error(`[sqs-queue] ${message}`);
}

export async function enqueueJobMessage(jobId: string): Promise<QueueDispatchResult> {
  const config = getSqsQueueConfig();

  if (!config) {
    logQueueInfo("Skipping SQS enqueue because AWS queue configuration is missing.", {
      jobId
    });

    return {
      success: false,
      skipped: true,
      error:
        "AWS SQS is not configured. Set AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_SQS_QUEUE_URL."
    };
  }

  const client = getSqsClient(config);
  const isFifoQueue = config.queueUrl.endsWith(".fifo");

  try {
    const response = await client.send(
      new SendMessageCommand({
        QueueUrl: config.queueUrl,
        MessageBody: JSON.stringify({
          jobId
        }),
        ...(isFifoQueue
          ? {
              MessageDeduplicationId: jobId,
              MessageGroupId: "automation-job"
            }
          : {})
      })
    );

    logQueueInfo("Enqueued automation job message.", {
      jobId,
      messageId: response.MessageId ?? null
    });

    return {
      success: true,
      messageId: response.MessageId
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send job to SQS.";

    logQueueError("Failed to enqueue automation job message.", {
      jobId,
      error: message
    });

    return {
      success: false,
      error: message
    };
  }
}

export async function sendToQueue(job: AutomationJob): Promise<QueueDispatchResult> {
  return enqueueJobMessage(job.id);
}
