import { z } from "zod";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(jsonValueSchema), z.record(jsonValueSchema)])
);

const optionalTrimmedString = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .optional()
    .transform((value) => value || undefined);

const stringOrStringArraySchema = z.union([
  z.string().trim().min(1).max(160),
  z.array(z.string().trim().min(1).max(160)).max(12)
]);

const contactSchema = z
  .object({
    firstName: optionalTrimmedString(80),
    lastName: optionalTrimmedString(80),
    name: optionalTrimmedString(160),
    email: z
      .string()
      .trim()
      .email()
      .optional()
      .transform((value) => value?.toLowerCase()),
    phone: optionalTrimmedString(40),
    company: optionalTrimmedString(160)
  })
  .catchall(jsonValueSchema);

const antiAbuseSchema = z.object({
  honeypot: optionalTrimmedString(200),
  submittedAt: z.union([z.string().trim().min(1), z.number().finite()]).optional(),
  fingerprint: optionalTrimmedString(200),
  formId: optionalTrimmedString(120)
});

const baseSubmissionShape = {
  firstName: optionalTrimmedString(80),
  lastName: optionalTrimmedString(80),
  name: optionalTrimmedString(160),
  email: z
    .string()
    .trim()
    .email()
    .optional()
    .transform((value) => value?.toLowerCase()),
  phone: optionalTrimmedString(40),
  company: optionalTrimmedString(160),
  companyName: optionalTrimmedString(160),
  businessName: optionalTrimmedString(160),
  serviceInterest: stringOrStringArraySchema.optional(),
  services: stringOrStringArraySchema.optional(),
  notes: optionalTrimmedString(4000),
  message: optionalTrimmedString(4000),
  metadata: z.record(jsonValueSchema).optional(),
  details: z.record(jsonValueSchema).optional(),
  contact: contactSchema.optional(),
  antiAbuse: antiAbuseSchema.optional(),
  sourcePage: optionalTrimmedString(200),
  pagePath: optionalTrimmedString(200)
} satisfies z.ZodRawShape;

function createSubmissionSchema(extraShape: z.ZodRawShape = {}) {
  return z
    .object({
      ...baseSubmissionShape,
      ...extraShape
    })
    .catchall(jsonValueSchema)
    .superRefine((value, context) => {
      if (!value.email && !value.contact?.email) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Email is required.",
          path: ["email"]
        });
      }
    });
}

export const consultationSubmissionSchema = createSubmissionSchema({
  preferredContactMethod: optionalTrimmedString(80),
  preferredDate: optionalTrimmedString(120),
  goals: optionalTrimmedString(2000),
  challenges: optionalTrimmedString(2000)
});

export const intakeSubmissionSchema = createSubmissionSchema({
  timeline: optionalTrimmedString(160),
  budget: optionalTrimmedString(160),
  currentChallenges: optionalTrimmedString(2000),
  primaryGoal: optionalTrimmedString(2000)
});

export const onboardingSubmissionSchema = createSubmissionSchema({
  kickoffDate: optionalTrimmedString(120),
  startDate: optionalTrimmedString(120),
  billingContact: optionalTrimmedString(2000),
  accountAccess: optionalTrimmedString(2000)
});

export const publicSubmissionSchemas = {
  consultation: consultationSubmissionSchema,
  intake: intakeSubmissionSchema,
  onboarding: onboardingSubmissionSchema
} as const;

export type PublicSubmissionKind = keyof typeof publicSubmissionSchemas;
export type ConsultationSubmissionInput = z.infer<typeof consultationSubmissionSchema>;
export type IntakeSubmissionInput = z.infer<typeof intakeSubmissionSchema>;
export type OnboardingSubmissionInput = z.infer<typeof onboardingSubmissionSchema>;
export type PublicSubmissionInput =
  | ConsultationSubmissionInput
  | IntakeSubmissionInput
  | OnboardingSubmissionInput;
