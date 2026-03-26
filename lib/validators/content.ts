import { z } from "zod";

import { contentPlatformOptions, contentStatusOptions } from "@/lib/utils/domain-options";
import { optionalDateStringSchema } from "@/lib/validators/shared";

export const contentPlatformSchema = z.enum(contentPlatformOptions);

export const contentStatusSchema = z.enum(contentStatusOptions);

const contentFieldsSchema = z.object({
  title: z.string().trim().min(2).max(140),
  platform: contentPlatformSchema,
  format: z.string().trim().min(2).max(80),
  copy: z.string().trim().min(2).max(5000),
  mediaUrl: z.union([z.string().trim().url(), z.literal("")]).optional(),
  status: contentStatusSchema.default("DRAFT"),
  scheduledFor: optionalDateStringSchema,
  campaignId: z.string().trim().min(1).optional()
});

function withContentSchedulingValidation<T extends z.ZodTypeAny>(schema: T) {
  return schema.superRefine((value, context) => {
    if (value.status === "SCHEDULED" && !value.scheduledFor) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Scheduled content needs a scheduled date and time.",
        path: ["scheduledFor"]
      });
    }
  });
}

export const createContentItemSchema = withContentSchedulingValidation(contentFieldsSchema);

export const updateContentItemSchema = withContentSchedulingValidation(
  contentFieldsSchema.extend({
    id: z.string().min(1)
  })
);
