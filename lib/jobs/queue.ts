export async function enqueueAutomationJob(type: string, payload: Record<string, unknown>) {
  return {
    queued: true,
    type,
    payload
  };
}
