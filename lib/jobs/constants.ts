import type { JobStatus } from "@prisma/client";

export const JOB_STATUS = {
  QUEUED: "queued",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed"
} as const;

export type JobLifecycleStatus = (typeof JOB_STATUS)[keyof typeof JOB_STATUS];

export const JOB_STATUS_TO_DB: Record<JobLifecycleStatus, JobStatus> = {
  [JOB_STATUS.QUEUED]: "QUEUED",
  [JOB_STATUS.PROCESSING]: "RUNNING",
  [JOB_STATUS.COMPLETED]: "SUCCEEDED",
  [JOB_STATUS.FAILED]: "FAILED"
};
