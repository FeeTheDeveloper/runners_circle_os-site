import { Badge } from "@/components/ui/badge";
import { formatTokenLabel, statusTone } from "@/lib/utils/format";

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant={statusTone(status)}>{formatTokenLabel(status)}</Badge>;
}
