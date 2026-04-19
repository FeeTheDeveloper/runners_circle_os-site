"use client";

import { useActionState } from "react";

import { retryAutomationJob, runAutomationJob } from "@/actions/jobs";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialActionState } from "@/lib/utils/action-state";

type JobExecutionFormProps = {
  jobId: string;
  mode: "run" | "retry";
};

export function JobExecutionForm({ jobId, mode }: JobExecutionFormProps) {
  const action = mode === "retry" ? retryAutomationJob : runAutomationJob;
  const [state, formAction] = useActionState(action, initialActionState);

  return (
    <form action={formAction} className="space-y-2">
      <input name="jobId" type="hidden" value={jobId} />
      <SubmitButton pendingLabel={mode === "retry" ? "Retrying..." : "Running..."} variant="secondary">
        {mode === "retry" ? "Retry" : "Run now"}
      </SubmitButton>
      {state.status === "error" && state.message ? <p className="text-xs text-rose-300">{state.message}</p> : null}
    </form>
  );
}
