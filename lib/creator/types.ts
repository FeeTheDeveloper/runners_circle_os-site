import type { Prisma } from "@prisma/client";

export const creatorRequestTypeOptions = ["IMAGE", "VIDEO"] as const;
export const creatorRequestStatusOptions = ["QUEUED", "PROCESSING", "COMPLETED", "FAILED"] as const;
export const generatedAssetTypeOptions = ["IMAGE", "VIDEO"] as const;
export const generatedAssetStatusOptions = ["READY", "FAILED"] as const;

export const creatorTemplateKeys = [
  "image_offer_card",
  "image_quote_card",
  "video_service_promo",
  "video_music_teaser"
] as const;

export type CreatorRequestTypeValue = (typeof creatorRequestTypeOptions)[number];
export type CreatorRequestStatusValue = (typeof creatorRequestStatusOptions)[number];
export type GeneratedAssetTypeValue = (typeof generatedAssetTypeOptions)[number];
export type GeneratedAssetStatusValue = (typeof generatedAssetStatusOptions)[number];
export type CreatorTemplateKey = (typeof creatorTemplateKeys)[number];
export type CreatorTemplateFieldKey = "headline" | "body" | "cta" | "accentText";

export type CreatorTemplateDefinition = {
  key: CreatorTemplateKey;
  type: CreatorRequestTypeValue;
  label: string;
  description: string;
  aspectRatio: string;
  dimensions: {
    width: number;
    height: number;
  };
  requiredFields: CreatorTemplateFieldKey[];
  recommendedFormat: string;
  durationInFrames?: number;
  fps?: number;
};

export type BrandKit = {
  slug: string;
  label: string;
  description: string;
  logoText: string;
  colors: {
    background: string;
    surface: string;
    foreground: string;
    muted: string;
    primary: string;
    secondary: string;
    accent: string;
  };
};

export type CreatorRenderBrand = Pick<BrandKit, "slug" | "label" | "logoText" | "colors">;

export type CreatorRenderInput = {
  headline: string;
  body: string;
  cta: string;
  accentText: string | null;
  brand: CreatorRenderBrand;
  platform: string;
  format: string;
  templateLabel: string;
};

export type CreatorVideoCompositionProps = CreatorRenderInput & {
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
};

export type GeneratedAssetDraft = {
  assetType: GeneratedAssetTypeValue;
  title: string;
  url: string;
  storageKey: string | null;
  width: number | null;
  height: number | null;
  durationSec: number | null;
  metadata: Prisma.InputJsonValue;
};
