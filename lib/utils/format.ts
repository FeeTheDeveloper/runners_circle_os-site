export function formatDate(value?: string | Date | null) {
  if (!value) {
    return "Not set";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

export function formatDateTime(value?: string | Date | null) {
  if (!value) {
    return "Not scheduled";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

export function formatTokenLabel(value: string) {
  return value
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function statusTone(status: string) {
  const normalized = status.toLowerCase();

  if (
    [
      "active",
      "approved",
      "published",
      "qualified",
      "won",
      "connected",
      "configured",
      "succeeded",
      "completed",
      "healthy"
    ].includes(normalized)
  ) {
    return "success" as const;
  }

  if (
    [
      "paused",
      "scheduled",
      "queued",
      "planned",
      "review",
      "pending",
      "warning",
      "nurturing",
      "new",
      "degraded"
    ].includes(
      normalized
    )
  ) {
    return "warning" as const;
  }

  if (
    ["failed", "archived", "lost", "disconnected", "disabled", "error", "missing", "cancelled"].includes(
      normalized
    )
  ) {
    return "danger" as const;
  }

  if (["running"].includes(normalized)) {
    return "info" as const;
  }

  return "neutral" as const;
}
