import type { ActionState } from "@/lib/utils/action-state";

export function FormMessage({ state }: { state: ActionState }) {
  if (state.status === "idle" || !state.message) {
    return null;
  }

  return (
    <div
      className={
        state.status === "success"
          ? "rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100"
          : "rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100"
      }
    >
      {state.message}
    </div>
  );
}
