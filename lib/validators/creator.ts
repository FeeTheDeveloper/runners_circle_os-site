import { z } from "zod";

import { brandKits } from "@/lib/creator/brand-kits";
import { getCreatorTemplate } from "@/lib/creator/template-registry";
import { creatorRequestTypeOptions, creatorTemplateKeys } from "@/lib/creator/types";
import { contentPlatformOptions } from "@/lib/utils/domain-options";

const knownBrandSlugs = brandKits.map((brand) => brand.slug);

export const createCreatorRequestSchema = z
  .object({
    type: z.enum(creatorRequestTypeOptions),
    templateKey: z.enum(creatorTemplateKeys),
    platform: z.enum(contentPlatformOptions),
    format: z.string().trim().min(2).max(80),
    brandSlug: z.string().trim().refine((value) => knownBrandSlugs.includes(value), {
      message: "Choose a supported brand kit."
    }),
    headline: z.string().trim().min(3).max(140),
    body: z.string().trim().min(8).max(600),
    cta: z.string().trim().max(120),
    campaignId: z.string().trim().min(1).optional().nullable(),
    accentText: z.string().trim().max(80).optional().nullable()
  })
  .superRefine((value, ctx) => {
    const template = getCreatorTemplate(value.templateKey);

    if (!template) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Choose a supported creator template.",
        path: ["templateKey"]
      });

      return;
    }

    if (template.type !== value.type) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Template type must match the requested generation type.",
        path: ["templateKey"]
      });
    }

    if (template.requiredFields.includes("cta") && value.cta.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CTA is required for this template.",
        path: ["cta"]
      });
    }
  });
