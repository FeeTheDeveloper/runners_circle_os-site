import type { JobStatus } from "@prisma/client";

export const JOB_STATUS = {
  QUEUED: "queued",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed"
} as const;

export type JobLifecycleStatus = (typeof JOB_STATUS)[keyof typeof JOB_STATUS];
export type JobDisplayStatus = JobLifecycleStatus | "cancelled";

export const JOB_STATUS_TO_DB: Record<JobLifecycleStatus, JobStatus> = {
  [JOB_STATUS.QUEUED]: "QUEUED",
  [JOB_STATUS.PROCESSING]: "RUNNING",
  [JOB_STATUS.COMPLETED]: "SUCCEEDED",
  [JOB_STATUS.FAILED]: "FAILED"
};

export const DB_JOB_STATUS_TO_LIFECYCLE: Record<JobStatus, JobDisplayStatus> = {
  QUEUED: JOB_STATUS.QUEUED,
  RUNNING: JOB_STATUS.PROCESSING,
  SUCCEEDED: JOB_STATUS.COMPLETED,
  FAILED: JOB_STATUS.FAILED,
  CANCELLED: "cancelled"
};

export function getJobDisplayStatus(status: JobStatus) {
  return DB_JOB_STATUS_TO_LIFECYCLE[status];
}

export function isJobRunnable(status: JobStatus) {
  return status === JOB_STATUS_TO_DB[JOB_STATUS.QUEUED] || status === JOB_STATUS_TO_DB[JOB_STATUS.FAILED];
}
