import { z } from "zod";

import { leadStatusOptions } from "@/lib/utils/domain-options";

export const leadStatusSchema = z.enum(leadStatusOptions);

const leadTagSchema = z.string().trim().min(1).max(40);

const leadFieldsSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  company: z.string().trim().max(160).optional(),
  source: z.string().trim().max(120).optional(),
  status: leadStatusSchema.default("NEW"),
  tags: z.array(leadTagSchema).default([]).transform((tags) => Array.from(new Set(tags))),
  notes: z.string().trim().max(2000).optional(),
  segmentId: z.string().trim().min(1).optional()
});

export const createLeadSchema = leadFieldsSchema;

export const updateLeadSchema = leadFieldsSchema.extend({
  id: z.string().min(1)
});
