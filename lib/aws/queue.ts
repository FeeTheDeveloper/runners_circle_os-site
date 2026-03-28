import "server-only";

import type { AutomationJob } from "@prisma/client";
import { SendMessageCommand } from "@aws-sdk/client-sqs";

import { getSqsClient, getSqsQueueConfig } from "@/lib/aws/sqs";

export type QueueDispatchResult =
  | {
      success: true;
      messageId?: string;
    }
  | {
      success: false;
      error: string;
    };

export async function sendToQueue(job: AutomationJob): Promise<QueueDispatchResult> {
  const config = getSqsQueueConfig();

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
