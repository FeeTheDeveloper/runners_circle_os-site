"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function RunDispatcherButton() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleRunDispatcher() {
    setFeedback(null);
    setError(null);

    try {
      const response = await fetch("/api/jobs/dispatch", {
        method: "POST"
      });
      const payload = (await response.json().catch(() => null)) as
        | {
            dispatched?: number;
            error?: string;
          }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Dispatcher request failed.");
      }

      const dispatched = payload?.dispatched ?? 0;
      setFeedback(`Dispatcher ran successfully. ${dispatched} job${dispatched === 1 ? "" : "s"} dispatched.`);
      startTransition(() => {
        router.refresh();
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Dispatcher request failed.");
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button onClick={handleRunDispatcher} type="button" variant="secondary">
        {isPending ? "Running dispatcher..." : "Run Dispatcher"}
      </Button>
      {feedback ? <p className="text-xs text-emerald-300">{feedback}</p> : null}
      {error ? <p className="text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}
