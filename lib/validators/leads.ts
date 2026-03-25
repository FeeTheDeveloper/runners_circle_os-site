import { z } from "zod";

import { leadStatusOptions } from "@/lib/utils/domain-options";

export const leadStatusSchema = z.enum(leadStatusOptions);

export const createLeadSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email(),
  company: z.string().max(160).optional(),
  source: z.string().max(120).optional(),
  status: leadStatusSchema.default("NEW"),
  tags: z.array(z.string().min(1)).default([]),
  notes: z.string().max(2000).optional(),
  segmentId: z.string().optional()
});

export const updateLeadSchema = createLeadSchema.extend({
  id: z.string().min(1)
});
