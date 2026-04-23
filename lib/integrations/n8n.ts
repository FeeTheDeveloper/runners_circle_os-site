export async function notifyN8nJobComplete(payload: any) {
  const url = process.env.N8N_JOB_COMPLETE_WEBHOOK_URL;

  if (!url) {
    console.log("n8n webhook skipped - no URL set");
    return;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      console.error("n8n webhook failed:", res.status);
    } else {
      console.log("n8n webhook success");
    }
  } catch (err) {
    console.error("n8n webhook error:", err);
  }
}
