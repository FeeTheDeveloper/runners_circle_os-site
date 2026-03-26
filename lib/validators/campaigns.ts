import { z } from "zod";

import { campaignStatusOptions } from "@/lib/utils/domain-options";
import { optionalDateStringSchema } from "@/lib/validators/shared";

export const campaignStatusSchema = z.enum(campaignStatusOptions);

const campaignFieldsSchema = z.object({
  name: z.string().trim().min(2).max(120),
  objective: z.string().trim().min(2).max(240),
  description: z.string().trim().max(2000).optional(),
  status: campaignStatusSchema.default("DRAFT"),
  startDate: optionalDateStringSchema,
  endDate: optionalDateStringSchema
});

function withCampaignTimelineValidation<T extends z.ZodTypeAny>(schema: T) {
  return schema.superRefine((value, context) => {
    if (!value.startDate || !value.endDate) {
      return;
    }

    const startDate = new Date(value.startDate);
    const endDate = new Date(value.endDate);

    if (endDate < startDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be on or after the start date.",
        path: ["endDate"]
      });
    }
  });
}

export const createCampaignSchema = withCampaignTimelineValidation(campaignFieldsSchema);

export const updateCampaignSchema = withCampaignTimelineValidation(
  campaignFieldsSchema.extend({
    id: z.string().min(1)
  })
);

export const deleteCampaignSchema = z.object({
  id: z.string().min(1)
});
