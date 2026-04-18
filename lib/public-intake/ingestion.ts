import "server-only";

import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { Prisma, PublicSubmissionType } from "@prisma/client";

import { isDatabaseConfigured, normalizeDatabaseError, prisma } from "@/lib/db";
import {
  publicSubmissionSchemas,
  type PublicSubmissionInput,
  type PublicSubmissionKind
} from "@/lib/validators/public-submissions";

type PublicResponse =
  | {
      ok: true;
      id: string;
      message: string;
    }
  | {
      ok: false;
      error: string;
    };

type JsonRecord = Record<string, unknown>;

type NormalizedSubmission = {
  kind: PublicSubmissionKind;
  source: string;
  type: PublicSubmissionType;
  successMessage: string;
  lead: {
    firstName: string;
    lastName: string;
    email: string;
    company: string | null;
    source: string;
    tags: string[];
    notesBlock: string;
  };
  summary: {
    kind: PublicSubmissionKind;
    source: string;
    receivedAt: string;
    contact: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string | null;
    };
    company: string | null;
    serviceInterests: string[];
    notes: string | null;
    sourcePage: string | null;
    details: Record<string, unknown>;
    metadata: Record<string, unknown> | null;
  };
};

const submissionConfig: Record<
  PublicSubmissionKind,
  {
    source: string;
    type: PublicSubmissionType;
    successMessage: string;
  }
> = {
  consultation: {
    source: "website-consultation",
    type: PublicSubmissionType.CONSULTATION,
    successMessage: "Consultation submission received."
  },
  intake: {
    source: "website-intake",
    type: PublicSubmissionType.INTAKE,
    successMessage: "Intake submission received."
  },
  onboarding: {
    source: "website-onboarding",
    type: PublicSubmissionType.ONBOARDING,
    successMessage: "Onboarding submission received."
  }
};

const noteExcludedKeys = new Set([
  "firstName",
  "first_name",
  "lastName",
  "last_name",
  "name",
  "fullName",
  "email",
  "phone",
  "phoneNumber",
  "phone_number",
  "company",
  "companyName",
  "businessName",
  "organization",
  "serviceInterest",
  "service_interest",
  "services",
  "notes",
  "message",
  "contact",
  "antiAbuse",
  "metadata",
  "details",
  "pagePath",
  "sourcePage"
]);

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function getNestedValue(record: JsonRecord, path: string[]) {
  let current: unknown = record;

  for (const segment of path) {
    if (!isRecord(current)) {
      return undefined;
    }

    current = current[segment];
  }

  return current;
}

function getFirstString(record: JsonRecord, paths: string[][]) {
  for (const path of paths) {
    const value = getNestedValue(record, path);

    if (typeof value === "string") {
      const normalized = normalizeWhitespace(value);

      if (normalized) {
        return normalized;
      }
    }
  }

  return undefined;
}

function getStringList(record: JsonRecord, paths: string[][]) {
  const items: string[] = [];

  for (const path of paths) {
    const value = getNestedValue(record, path);

    if (typeof value === "string") {
      const normalized = normalizeWhitespace(value);

      if (normalized) {
        items.push(normalized);
      }
    }

    if (Array.isArray(value)) {
      for (const entry of value) {
        if (typeof entry !== "string") {
          continue;
        }

        const normalized = normalizeWhitespace(entry);

        if (normalized) {
          items.push(normalized);
        }
      }
    }
  }

  return Array.from(new Set(items));
}

function toTitleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function deriveNameParts(record: JsonRecord, email: string) {
  const explicitFirstName = getFirstString(record, [
    ["firstName"],
    ["first_name"],
    ["contact", "firstName"],
    ["contact", "first_name"]
  ]);
  const explicitLastName = getFirstString(record, [
    ["lastName"],
    ["last_name"],
    ["contact", "lastName"],
    ["contact", "last_name"]
  ]);
  const fullName = getFirstString(record, [
    ["name"],
    ["fullName"],
    ["contact", "name"],
    ["contact", "fullName"]
  ]);

  let derivedFirstName = explicitFirstName;
  let derivedLastName = explicitLastName;

  if ((!derivedFirstName || !derivedLastName) && fullName) {
    const nameParts = fullName.split(" ").filter(Boolean);

    if (!derivedFirstName && nameParts.length > 0) {
      derivedFirstName = nameParts[0];
    }

    if (!derivedLastName && nameParts.length > 1) {
      derivedLastName = nameParts.slice(1).join(" ");
    }
  }

  if (!derivedFirstName || !derivedLastName) {
    const emailNameParts = email
      .split("@")[0]
      .split(/[._-]+/)
      .map((part) => normalizeWhitespace(part))
      .filter(Boolean);

    if (!derivedFirstName && emailNameParts.length > 0) {
      derivedFirstName = toTitleCase(emailNameParts[0]);
    }

    if (!derivedLastName && emailNameParts.length > 1) {
      derivedLastName = toTitleCase(emailNameParts.slice(1).join(" "));
    }
  }

  return {
    firstName: derivedFirstName ?? "Website",
    lastName: derivedLastName ?? "Lead"
  };
}

function buildTag(value: string) {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized.slice(0, 40);
}

function serializeDetailValue(value: unknown): string {
  const truncate = (input: string) => (input.length > 240 ? `${input.slice(0, 237)}...` : input);

  if (typeof value === "string") {
    return truncate(normalizeWhitespace(value));
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return truncate(String(value));
  }

  if (Array.isArray(value)) {
    const serializedItems: string[] = value
      .map((item) => serializeDetailValue(item))
      .filter(Boolean)
      .slice(0, 6);

    return truncate(serializedItems.join(", "));
  }

  if (isRecord(value)) {
    try {
      return truncate(JSON.stringify(value));
    } catch {
      return "[unserializable object]";
    }
  }

  return "";
}

function formatDetailKey(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (character) => character.toUpperCase());
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function parseSubmittedAt(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }

  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }

  return undefined;
}

function extractIpAddress(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? null;
  }

  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    null
  );
}

function buildRequestMeta(
  request: NextRequest,
  payload: PublicSubmissionInput,
  receivedAt: Date,
  sourcePage: string | null
) {
  const submittedAt = parseSubmittedAt(payload.antiAbuse?.submittedAt);

  return {
    receivedAt: receivedAt.toISOString(),
    ipAddress: extractIpAddress(request),
    userAgent: request.headers.get("user-agent"),
    origin: request.headers.get("origin"),
    referer: request.headers.get("referer"),
    forwardedHost: request.headers.get("x-forwarded-host"),
    sourcePage,
    antiAbuse: {
      formId: payload.antiAbuse?.formId ?? null,
      fingerprint: payload.antiAbuse?.fingerprint ?? null,
      honeypotDetected: Boolean(payload.antiAbuse?.honeypot),
      submittedAt: submittedAt?.toISOString() ?? null,
      rapidSubmit:
        submittedAt !== undefined &&
        receivedAt.getTime() - submittedAt.getTime() < 2_000
    }
  };
}

function collectStructuredDetails(record: JsonRecord) {
  const topLevelDetails: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(record)) {
    if (noteExcludedKeys.has(key)) {
      continue;
    }

    topLevelDetails[key] = value;
  }

  return {
    topLevel: topLevelDetails,
    details: isRecord(record.details) ? record.details : {},
    metadata: isRecord(record.metadata) ? record.metadata : {}
  };
}

function buildLeadNotes(normalized: {
  kind: PublicSubmissionKind;
  source: string;
  receivedAt: Date;
  phone: string | null;
  company: string | null;
  notes: string | null;
  serviceInterests: string[];
  sourcePage: string | null;
  details: {
    topLevel: Record<string, unknown>;
    details: Record<string, unknown>;
  };
}) {
  const lines = [
    `Public ${normalized.kind} submission`,
    `Received: ${normalized.receivedAt.toISOString()}`,
    `Source: ${normalized.source}`
  ];

  if (normalized.phone) {
    lines.push(`Phone: ${normalized.phone}`);
  }

  if (normalized.company) {
    lines.push(`Company: ${normalized.company}`);
  }

  if (normalized.sourcePage) {
    lines.push(`Source page: ${normalized.sourcePage}`);
  }

  if (normalized.serviceInterests.length > 0) {
    lines.push(`Service interest: ${normalized.serviceInterests.join(", ")}`);
  }

  if (normalized.notes) {
    lines.push(`Notes: ${normalized.notes}`);
  }

  const detailLines = [...Object.entries(normalized.details.topLevel), ...Object.entries(normalized.details.details)]
    .map(([key, value]) => {
      const serializedValue = serializeDetailValue(value);

      if (!serializedValue) {
        return null;
      }

      return `${formatDetailKey(key)}: ${serializedValue}`;
    })
    .filter((value): value is string => Boolean(value))
    .slice(0, 8);

  if (detailLines.length > 0) {
    lines.push("Additional details:");

    for (const detailLine of detailLines) {
      lines.push(`- ${detailLine}`);
    }
  }

  return lines.join("\n");
}

function appendNotes(existingNotes: string | null, notesBlock: string) {
  return existingNotes ? `${existingNotes}\n\n---\n\n${notesBlock}` : notesBlock;
}

function shouldReplaceDerivedName(existingValue: string, fallbackValue: string) {
  return !existingValue || existingValue === fallbackValue;
}

function normalizeSubmission(
  payload: PublicSubmissionInput,
  kind: PublicSubmissionKind,
  receivedAt: Date
): NormalizedSubmission {
  const config = submissionConfig[kind];
  const record = payload as JsonRecord;
  const email =
    getFirstString(record, [["email"], ["contact", "email"]])?.toLowerCase() ??
    payload.email ??
    payload.contact?.email ??
    "";
  const nameParts = deriveNameParts(record, email);
  const company =
    getFirstString(record, [
      ["company"],
      ["companyName"],
      ["businessName"],
      ["organization"],
      ["contact", "company"]
    ]) ?? null;
  const phone =
    getFirstString(record, [
      ["phone"],
      ["phoneNumber"],
      ["phone_number"],
      ["contact", "phone"],
      ["contact", "phoneNumber"],
      ["contact", "phone_number"]
    ]) ?? null;
  const serviceInterests = getStringList(record, [
    ["serviceInterest"],
    ["service_interest"],
    ["services"],
    ["interests"],
    ["selectedServices"]
  ]);
  const notesList = getStringList(record, [["notes"], ["message"]]);
  const notes = notesList.length > 0 ? notesList.join("\n\n") : null;
  const sourcePage =
    getFirstString(record, [["pagePath"], ["sourcePage"]]) ??
    getFirstString(record, [["metadata", "pagePath"], ["metadata", "sourcePage"]]) ??
    null;
  const structuredDetails = collectStructuredDetails(record);
  const tags = [
    "public-site",
    config.source,
    `submission-${kind}`,
    ...serviceInterests.map((interest) => `service-${buildTag(interest)}`)
  ].filter(Boolean);

  return {
    kind,
    source: config.source,
    type: config.type,
    successMessage: config.successMessage,
    lead: {
      firstName: nameParts.firstName,
      lastName: nameParts.lastName,
      email,
      company,
      source: config.source,
      tags: Array.from(new Set(tags)),
      notesBlock: buildLeadNotes({
        kind,
        source: config.source,
        receivedAt,
        phone,
        company,
        notes,
        serviceInterests,
        sourcePage,
        details: {
          topLevel: structuredDetails.topLevel,
          details: structuredDetails.details
        }
      })
    },
    summary: {
      kind,
      source: config.source,
      receivedAt: receivedAt.toISOString(),
      contact: {
        firstName: nameParts.firstName,
        lastName: nameParts.lastName,
        email,
        phone
      },
      company,
      serviceInterests,
      notes,
      sourcePage,
      details: {
        ...structuredDetails.topLevel,
        details: structuredDetails.details
      },
      metadata: Object.keys(structuredDetails.metadata).length > 0 ? structuredDetails.metadata : null
    }
  };
}

export async function ingestPublicSubmission(
  request: NextRequest,
  kind: PublicSubmissionKind
): Promise<{ status: number; body: PublicResponse }> {
  if (!isDatabaseConfigured()) {
    return {
      status: 503,
      body: {
        ok: false,
        error: "DATABASE_URL is not configured for public ingestion."
      }
    };
  }

  const rawPayload = await request.json().catch(() => null);

  if (!isRecord(rawPayload)) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "A JSON object payload is required."
      }
    };
  }

  const parsed = publicSubmissionSchemas[kind].safeParse(rawPayload);

  if (!parsed.success) {
    return {
      status: 400,
      body: {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Invalid submission payload."
      }
    };
  }

  if (parsed.data.antiAbuse?.honeypot) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "Invalid submission."
      }
    };
  }

  const receivedAt = new Date();
  const normalized = normalizeSubmission(parsed.data, kind, receivedAt);
  const requestMeta = buildRequestMeta(
    request,
    parsed.data,
    receivedAt,
    normalized.summary.sourcePage
  );

  try {
    const result = await prisma.$transaction(async (transaction) => {
      const existingLead = await transaction.lead.findUnique({
        where: {
          email: normalized.lead.email
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          company: true,
          tags: true,
          notes: true
        }
      });

      const mergedTags = Array.from(
        new Set([...(existingLead?.tags ?? []), ...normalized.lead.tags])
      );

      const lead = existingLead
        ? await transaction.lead.update({
            where: {
              id: existingLead.id
            },
            data: {
              firstName: shouldReplaceDerivedName(existingLead.firstName, "Website")
                ? normalized.lead.firstName
                : existingLead.firstName,
              lastName: shouldReplaceDerivedName(existingLead.lastName, "Lead")
                ? normalized.lead.lastName
                : existingLead.lastName,
              company: normalized.lead.company ?? existingLead.company,
              source: normalized.lead.source,
              tags: mergedTags,
              notes: appendNotes(existingLead.notes, normalized.lead.notesBlock)
            },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              company: true
            }
          })
        : await transaction.lead.create({
            data: {
              firstName: normalized.lead.firstName,
              lastName: normalized.lead.lastName,
              email: normalized.lead.email,
              company: normalized.lead.company,
              source: normalized.lead.source,
              tags: mergedTags,
              notes: normalized.lead.notesBlock
            },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              company: true
            }
          });

      await transaction.publicSubmission.create({
        data: {
          type: normalized.type,
          source: normalized.source,
          email: normalized.lead.email,
          name: `${lead.firstName} ${lead.lastName}`.trim(),
          company: lead.company,
          payload: toJsonValue(rawPayload),
          summary: toJsonValue(normalized.summary),
          requestMeta: toJsonValue(requestMeta),
          leadId: lead.id
        }
      });

      return {
        created: !existingLead,
        lead
      };
    });

    revalidatePath("/leads");
    revalidatePath("/dashboard");

    return {
      status: result.created ? 201 : 200,
      body: {
        ok: true,
        id: result.lead.id,
        message: normalized.successMessage
      }
    };
  } catch (error) {
    return {
      status: 500,
      body: {
        ok: false,
        error: normalizeDatabaseError(error)
      }
    };
  }
}
