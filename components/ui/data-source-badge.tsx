import type { DataSource } from "@/lib/db";

import { Badge } from "@/components/ui/badge";

export function DataSourceBadge({ source }: { source: DataSource }) {
  return source === "database" ? (
    <Badge variant="success">Live database</Badge>
  ) : (
    <Badge variant="warning">Database unavailable</Badge>
  );
}
