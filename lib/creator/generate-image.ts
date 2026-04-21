import "server-only";

import type { CreatorTemplateKey, GeneratedAssetDraft } from "@/lib/creator/types";

import { getBrandKit } from "@/lib/creator/brand-kits";
import { getCreatorTemplate } from "@/lib/creator/template-registry";

type GenerateImageInput = {
  templateKey: Extract<CreatorTemplateKey, "image_offer_card" | "image_quote_card">;
  brandSlug: string;
  headline: string;
  body: string;
  cta: string;
  accentText?: string | null;
  platform: string;
  format: string;
};

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function wrapLines(text: string, maxChars: number) {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;

    if (candidate.length <= maxChars) {
      currentLine = candidate;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }

      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.slice(0, 5);
}

function renderOfferCard(input: GenerateImageInput) {
  const brand = getBrandKit(input.brandSlug);
  const template = getCreatorTemplate("image_offer_card");

  if (!template) {
    throw new Error("Image offer card template is not registered.");
  }

  const headlineLines = wrapLines(input.headline, 18);
  const bodyLines = wrapLines(input.body, 34);
  const accentText = input.accentText?.trim() || input.format;

  return {
    title: `${brand.label} Offer Card`,
    width: template.dimensions.width,
    height: template.dimensions.height,
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" width="${template.dimensions.width}" height="${template.dimensions.height}" viewBox="0 0 ${template.dimensions.width} ${template.dimensions.height}" role="img" aria-label="${escapeXml(input.headline)}">
        <defs>
          <linearGradient id="offer-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${brand.colors.background}" />
            <stop offset="45%" stop-color="${brand.colors.surface}" />
            <stop offset="100%" stop-color="${brand.colors.secondary}" />
          </linearGradient>
          <linearGradient id="offer-accent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="${brand.colors.primary}" />
            <stop offset="100%" stop-color="${brand.colors.accent}" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" rx="52" fill="url(#offer-bg)" />
        <circle cx="930" cy="188" r="170" fill="${brand.colors.primary}" fill-opacity="0.16" />
        <circle cx="176" cy="1182" r="220" fill="${brand.colors.accent}" fill-opacity="0.12" />
        <rect x="72" y="70" width="360" height="56" rx="28" fill="${brand.colors.surface}" stroke="${brand.colors.primary}" stroke-opacity="0.4" />
        <text x="104" y="105" fill="${brand.colors.foreground}" font-family="Arial, sans-serif" font-size="24" font-weight="700" letter-spacing="3">${escapeXml(brand.logoText)}</text>
        <rect x="72" y="170" width="936" height="6" rx="3" fill="url(#offer-accent)" />
        ${headlineLines
          .map(
            (line, index) =>
              `<text x="76" y="${310 + index * 96}" fill="${brand.colors.foreground}" font-family="Arial, sans-serif" font-size="86" font-weight="800">${escapeXml(line)}</text>`
          )
          .join("")}
        ${bodyLines
          .map(
            (line, index) =>
              `<text x="80" y="${780 + index * 44}" fill="${brand.colors.muted}" font-family="Arial, sans-serif" font-size="34" font-weight="500">${escapeXml(line)}</text>`
          )
          .join("")}
        <rect x="72" y="1086" width="540" height="106" rx="34" fill="${brand.colors.foreground}" />
        <text x="112" y="1151" fill="${brand.colors.background}" font-family="Arial, sans-serif" font-size="38" font-weight="800">${escapeXml(input.cta || "Learn more")}</text>
        <text x="76" y="1268" fill="${brand.colors.primary}" font-family="Arial, sans-serif" font-size="28" font-weight="700" letter-spacing="2.5">${escapeXml(accentText.toUpperCase())}</text>
        <text x="798" y="1268" fill="${brand.colors.muted}" font-family="Arial, sans-serif" font-size="26" font-weight="600">${escapeXml(input.platform)}</text>
      </svg>
    `
  };
}

function renderQuoteCard(input: GenerateImageInput) {
  const brand = getBrandKit(input.brandSlug);
  const template = getCreatorTemplate("image_quote_card");

  if (!template) {
    throw new Error("Image quote card template is not registered.");
  }

  const headlineLines = wrapLines(input.headline, 22);
  const bodyLines = wrapLines(input.body, 32);
  const accentText = input.accentText?.trim() || "Featured quote";

  return {
    title: `${brand.label} Quote Card`,
    width: template.dimensions.width,
    height: template.dimensions.height,
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" width="${template.dimensions.width}" height="${template.dimensions.height}" viewBox="0 0 ${template.dimensions.width} ${template.dimensions.height}" role="img" aria-label="${escapeXml(input.headline)}">
        <defs>
          <radialGradient id="quote-bg" cx="24%" cy="18%" r="90%">
            <stop offset="0%" stop-color="${brand.colors.primary}" stop-opacity="0.24" />
            <stop offset="38%" stop-color="${brand.colors.surface}" stop-opacity="1" />
            <stop offset="100%" stop-color="${brand.colors.background}" stop-opacity="1" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" rx="40" fill="url(#quote-bg)" />
        <rect x="58" y="58" width="964" height="964" rx="34" fill="${brand.colors.surface}" fill-opacity="0.38" stroke="${brand.colors.primary}" stroke-opacity="0.3" />
        <text x="88" y="148" fill="${brand.colors.accent}" font-family="Georgia, serif" font-size="120" font-weight="700">“</text>
        ${headlineLines
          .map(
            (line, index) =>
              `<text x="116" y="${252 + index * 70}" fill="${brand.colors.foreground}" font-family="Arial, sans-serif" font-size="58" font-weight="800">${escapeXml(line)}</text>`
          )
          .join("")}
        ${bodyLines
          .map(
            (line, index) =>
              `<text x="118" y="${540 + index * 42}" fill="${brand.colors.muted}" font-family="Arial, sans-serif" font-size="30" font-weight="500">${escapeXml(line)}</text>`
          )
          .join("")}
        <rect x="116" y="858" width="360" height="52" rx="26" fill="${brand.colors.primary}" fill-opacity="0.16" />
        <text x="148" y="892" fill="${brand.colors.primary}" font-family="Arial, sans-serif" font-size="24" font-weight="700" letter-spacing="2">${escapeXml(accentText.toUpperCase())}</text>
        <text x="118" y="970" fill="${brand.colors.foreground}" font-family="Arial, sans-serif" font-size="28" font-weight="700">${escapeXml(brand.logoText)}</text>
        <text x="904" y="970" text-anchor="end" fill="${brand.colors.muted}" font-family="Arial, sans-serif" font-size="24" font-weight="600">${escapeXml(input.platform)}</text>
      </svg>
    `
  };
}

export async function generateImageAsset(input: GenerateImageInput): Promise<GeneratedAssetDraft> {
  const rendered = input.templateKey === "image_quote_card" ? renderQuoteCard(input) : renderOfferCard(input);
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(rendered.svg)}`;

  return {
    assetType: "IMAGE",
    title: rendered.title,
    url,
    storageKey: null,
    width: rendered.width,
    height: rendered.height,
    durationSec: null,
    metadata: {
      engine: "svg",
      templateKey: input.templateKey,
      platform: input.platform,
      format: input.format,
      brandSlug: input.brandSlug
    }
  };
}
