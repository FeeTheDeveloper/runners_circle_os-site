import "server-only";

import type { AutomationJob } from "@prisma/client";

export type QueueDispatchResult = {
  success: boolean;
  messageId?: string;
  error?: string;
};

export async function sendToQueue(job: AutomationJob): Promise<QueueDispatchResult> {
  const messageId = `mock-${job.id}`;

  console.info("[queue] dispatching automation job", {
    id: job.id,
    type: job.type,
    status: job.status,
    scheduledFor: job.scheduledFor?.toISOString() ?? null,
    messageId
  });

  return {
    success: true,
    messageId
  };
}
