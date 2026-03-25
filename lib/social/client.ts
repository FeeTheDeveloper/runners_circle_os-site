export async function publishScheduledContent() {
  return {
    queued: true,
    provider: "social"
  };
}

export async function refreshChannelHealth() {
  return {
    queued: true,
    provider: "social"
  };
}
