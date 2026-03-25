import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card className="border-dashed border-slate-700/70 bg-slate-950/40">
      <CardContent className="flex min-h-48 flex-col items-start justify-center gap-3">
        <div className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-200">
          Ready for build-out
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-50">{title}</h3>
          <p className="max-w-xl text-sm leading-6 text-slate-400">{description}</p>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}
