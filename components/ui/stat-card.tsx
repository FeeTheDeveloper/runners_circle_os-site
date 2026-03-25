import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: string;
  description: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
};

export function StatCard({
  label,
  value,
  description,
  tone = "neutral"
}: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <Badge variant={tone}>{tone === "neutral" ? "Tracked" : tone}</Badge>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-semibold text-white">{value}</p>
          <p className="text-sm leading-6 text-slate-400">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
