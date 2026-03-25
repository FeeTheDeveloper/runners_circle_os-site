import { z } from "zod";

export const createAudienceSegmentSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(500).optional(),
  marketLane: z.string().max(120).optional(),
  tags: z.array(z.string().min(1)).default([])
});

export const updateAudienceSegmentSchema = createAudienceSegmentSchema.extend({
  id: z.string().min(1)
});
