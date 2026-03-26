import { z } from "zod";

const audienceTagSchema = z.string().trim().min(1).max(40);

const audienceFieldsSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional(),
  marketLane: z.string().trim().max(120).optional(),
  tags: z.array(audienceTagSchema).default([]).transform((tags) => Array.from(new Set(tags)))
});

export const createAudienceSegmentSchema = audienceFieldsSchema;

export const updateAudienceSegmentSchema = audienceFieldsSchema.extend({
  id: z.string().min(1)
});
