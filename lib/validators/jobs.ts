import { z } from "zod";

import { jobStatusOptions, jobTypeOptions } from "@/lib/utils/domain-options";

export const jobTypeSchema = z.enum(jobTypeOptions);

export const jobStatusSchema = z.enum(jobStatusOptions);

export const createAutomationJobSchema = z.object({
  type: jobTypeSchema,
  status: jobStatusSchema.default("QUEUED"),
  scheduledFor: z.string().optional(),
  payload: z.record(z.string(), z.unknown()).default({})
});

export const updateAutomationJobSchema = createAutomationJobSchema.extend({
  id: z.string().min(1),
  result: z.record(z.string(), z.unknown()).optional()
});
