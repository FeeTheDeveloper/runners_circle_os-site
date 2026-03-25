export type CrmWebhookPayload = {
  event?: string;
  payload?: unknown;
};

export async function recordWebhookReceipt(input: CrmWebhookPayload) {
  return {
    accepted: true,
    provider: "crm",
    event: input.event ?? "unknown",
    receivedAt: new Date().toISOString()
  };
}

export async function syncLeadSnapshot() {
  return {
    queued: true,
    provider: "crm"
  };
}
