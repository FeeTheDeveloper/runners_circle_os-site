export const campaignStatusOptions = [
  "DRAFT",
  "PLANNED",
  "ACTIVE",
  "PAUSED",
  "COMPLETED",
  "ARCHIVED"
] as const;

export const contentPlatformOptions = [
  "INSTAGRAM",
  "FACEBOOK",
  "LINKEDIN",
  "TIKTOK",
  "EMAIL",
  "SMS",
  "WEB"
] as const;

export const contentStatusOptions = [
  "DRAFT",
  "REVIEW",
  "APPROVED",
  "SCHEDULED",
  "PUBLISHED",
  "ARCHIVED"
] as const;

export const leadStatusOptions = ["NEW", "QUALIFIED", "NURTURING", "WON", "LOST"] as const;

export const jobTypeOptions = [
  "CONTENT_PUBLISH",
  "CRM_SYNC",
  "LEAD_ENRICHMENT",
  "REPORT_EXPORT",
  "AUDIENCE_REFRESH"
] as const;

export const jobStatusOptions = ["QUEUED", "RUNNING", "SUCCEEDED", "FAILED", "CANCELLED"] as const;
