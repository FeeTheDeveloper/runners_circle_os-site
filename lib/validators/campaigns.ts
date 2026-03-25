import { z } from "zod";

import { campaignStatusOptions } from "@/lib/utils/domain-options";
import { optionalDateStringSchema } from "@/lib/validators/shared";

export const campaignStatusSchema = z.enum(campaignStatusOptions);

export const createCampaignSchema = z.object({
  name: z.string().min(2).max(120),
  objective: z.string().min(2).max(240),
  description: z.string().max(2000).optional(),
  status: campaignStatusSchema.default("DRAFT"),
  startDate: optionalDateStringSchema,
  endDate: optionalDateStringSchema
});

export const updateCampaignSchema = createCampaignSchema.extend({
  id: z.string().min(1)
});
