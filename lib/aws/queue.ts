import "server-only";

import type { AutomationJob } from "@prisma/client";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

export type QueueDispatchResult = {
  success: true;
  messageId?: string;
} | {
  success: false;
  error: string;
};

type QueueConfig = {
  accessKeyId: string;
  queueUrl: string;
  region: string;
  secretAccessKey: string;
};

const globalForSqs = globalThis as typeof globalThis & {
  sqsClient?: SQSClient;
};

function getQueueConfig(): QueueConfig | null {
  const region = process.env.AWS_REGION?.trim() ?? "";
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim() ?? "";
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim() ?? "";
  const queueUrl = process.env.AWS_SQS_QUEUE_URL?.trim() ?? "";

  if (!region || !accessKeyId || !secretAccessKey || !queueUrl) {
    return null;
  }

  return {
    accessKeyId,
    queueUrl,
    region,
    secretAccessKey
  };
}

function getSqsClient(config: QueueConfig) {
  if (!globalForSqs.sqsClient) {
    globalForSqs.sqsClient = new SQSClient({
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey
      },
      region: config.region
    });
  }

  return globalForSqs.sqsClient;
}

export async function sendToQueue(job: AutomationJob): Promise<QueueDispatchResult> {
  const config = getQueueConfig();

  if (!config) {
    return {
      success: false,
      error: "AWS SQS is not configured. Set AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_SQS_QUEUE_URL."
    };
  }

  const client = getSqsClient(config);
  const isFifoQueue = config.queueUrl.endsWith(".fifo");
  const payload = {
    jobId: job.id,
    type: job.type,
    payload: job.payload ?? null,
    scheduledFor: job.scheduledFor?.toISOString() ?? null
  };

  try {
    const response = await client.send(
      new SendMessageCommand({
        QueueUrl: config.queueUrl,
        MessageBody: JSON.stringify(payload),
        ...(isFifoQueue
          ? {
              MessageDeduplicationId: job.id,
              MessageGroupId: job.type
            }
          : {})
      })
    );

    return {
      success: true,
      messageId: response.MessageId
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send job to SQS."
    };
  }
}
