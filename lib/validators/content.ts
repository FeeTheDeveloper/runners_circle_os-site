import { z } from "zod";

import { contentPlatformOptions, contentStatusOptions } from "@/lib/utils/domain-options";
import { optionalDateStringSchema } from "@/lib/validators/shared";

export const contentPlatformSchema = z.enum(contentPlatformOptions);

export const contentStatusSchema = z.enum(contentStatusOptions);

export const createContentItemSchema = z.object({
  title: z.string().min(2).max(140),
  platform: contentPlatformSchema,
  format: z.string().min(2).max(80),
  copy: z.string().min(2).max(5000),
  mediaUrl: z.string().url().optional().or(z.literal("")),
  status: contentStatusSchema.default("DRAFT"),
  scheduledFor: optionalDateStringSchema,
  campaignId: z.string().optional()
});

export const updateContentItemSchema = createContentItemSchema.extend({
  id: z.string().min(1)
});
