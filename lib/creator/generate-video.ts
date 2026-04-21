import "server-only";

import type { CreatorTemplateKey, GeneratedAssetDraft } from "@/lib/creator/types";

import { getBrandKit } from "@/lib/creator/brand-kits";
import { getCreatorTemplate } from "@/lib/creator/template-registry";
import { creatorRemotionCompositions } from "@/remotion";

type GenerateVideoInput = {
  templateKey: Extract<CreatorTemplateKey, "video_service_promo" | "video_music_teaser">;
  brandSlug: string;
  headline: string;
  body: string;
  cta: string;
  accentText?: string | null;
  platform: string;
  format: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderServicePromoMarkup(input: GenerateVideoInput) {
  const brand = getBrandKit(input.brandSlug);

  return `
    <div style="width:100%;height:100%;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;padding:72px;font-family:Arial,sans-serif;background:linear-gradient(145deg, ${brand.colors.background} 0%, ${brand.colors.surface} 55%, ${brand.colors.secondary} 100%);color:${brand.colors.foreground};">
      <div>
        <div style="display:inline-flex;align-items:center;gap:16px;border-radius:999px;border:1px solid ${brand.colors.primary}55;background:${brand.colors.surface}aa;padding:16px 26px;font-size:28px;font-weight:700;letter-spacing:2px;">
          <span>${escapeHtml(brand.logoText)}</span>
          <span style="color:${brand.colors.primary};">${escapeHtml(input.platform)}</span>
        </div>
        <h1 style="font-size:106px;line-height:1.02;font-weight:800;margin:72px 0 28px;">${escapeHtml(input.headline)}</h1>
        <p style="font-size:40px;line-height:1.45;color:${brand.colors.muted};max-width:820px;margin:0;">${escapeHtml(input.body)}</p>
      </div>
      <div style="display:grid;gap:24px;">
        <div style="display:inline-flex;width:fit-content;border-radius:32px;background:${brand.colors.foreground};color:${brand.colors.background};padding:26px 34px;font-size:34px;font-weight:800;">
          ${escapeHtml(input.cta || "Learn more")}
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:24px;font-size:28px;font-weight:700;color:${brand.colors.primary};">
          <span>${escapeHtml(input.accentText?.trim() || "Built for fast operator approvals")}</span>
          <span style="color:${brand.colors.muted};">${escapeHtml(brand.label)}</span>
        </div>
      </div>
    </div>
  `;
}

function renderMusicTeaserMarkup(input: GenerateVideoInput) {
  const brand = getBrandKit(input.brandSlug);

  return `
    <div style="width:100%;height:100%;box-sizing:border-box;display:grid;grid-template-rows:1fr auto;padding:72px;font-family:Arial,sans-serif;background:radial-gradient(circle at 20% 20%, ${brand.colors.primary}40 0%, ${brand.colors.surface} 34%, ${brand.colors.background} 100%);color:${brand.colors.foreground};">
      <div style="display:grid;align-content:space-between;">
        <div style="display:inline-flex;width:fit-content;border-radius:999px;background:${brand.colors.surface}dd;border:1px solid ${brand.colors.accent}66;color:${brand.colors.accent};padding:14px 24px;font-size:28px;font-weight:700;letter-spacing:3px;">
          ${escapeHtml(input.accentText?.trim() || "New release")}
        </div>
        <div style="margin-top:82px;">
          <h1 style="font-size:118px;line-height:0.98;font-weight:900;margin:0;max-width:860px;">${escapeHtml(input.headline)}</h1>
          <p style="font-size:40px;line-height:1.45;color:${brand.colors.muted};max-width:820px;margin:34px 0 0;">${escapeHtml(input.body)}</p>
        </div>
      </div>
      <div style="display:grid;gap:24px;align-self:end;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:24px;color:${brand.colors.primary};font-size:30px;font-weight:700;">
          <span>${escapeHtml(input.platform)}</span>
          <span>${escapeHtml(brand.logoText)}</span>
        </div>
        <div style="border-radius:34px;border:2px solid ${brand.colors.foreground};padding:28px 34px;font-size:34px;font-weight:800;">
          ${escapeHtml(input.cta || "Stream now")}
        </div>
      </div>
    </div>
  `;
}

function renderHtmlDocument(bodyMarkup: string, width: number, height: number) {
  return [
    "<!DOCTYPE html>",
    "<html lang=\"en\">",
    "<head>",
    "  <meta charset=\"utf-8\" />",
    "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />",
    "  <title>Creator video preview</title>",
    "  <style>",
    "    html, body { margin: 0; padding: 0; background: #020617; }",
    "    body { display: grid; place-items: center; min-height: 100vh; }",
    `    .preview-frame { width: ${width}px; height: ${height}px; overflow: hidden; box-shadow: 0 24px 80px rgba(2, 6, 23, 0.45); }`,
    "  </style>",
    "</head>",
    "<body>",
    `  <div class=\"preview-frame\">${bodyMarkup}</div>`,
    "</body>",
    "</html>"
  ].join("\n");
}

export async function generateVideoAsset(input: GenerateVideoInput): Promise<GeneratedAssetDraft> {
  const template = getCreatorTemplate(input.templateKey);

  if (!template || template.type !== "VIDEO" || !template.durationInFrames || !template.fps) {
    throw new Error(`Video template ${input.templateKey} is not registered correctly.`);
  }

  const composition = creatorRemotionCompositions[input.templateKey];

  if (!composition) {
    throw new Error(`No Remotion composition is registered for ${input.templateKey}.`);
  }

  const bodyMarkup =
    input.templateKey === "video_music_teaser"
      ? renderMusicTeaserMarkup(input)
      : renderServicePromoMarkup(input);
  const document = renderHtmlDocument(bodyMarkup, template.dimensions.width, template.dimensions.height);
  const url = `data:text/html;charset=utf-8,${encodeURIComponent(document)}`;

  return {
    assetType: "VIDEO",
    title: `${getBrandKit(input.brandSlug).label} ${template.label}`,
    url,
    storageKey: null,
    width: template.dimensions.width,
    height: template.dimensions.height,
    durationSec: Math.round(template.durationInFrames / template.fps),
    metadata: {
      engine: "remotion-html-preview",
      compositionId: composition.id,
      templateKey: input.templateKey,
      platform: input.platform,
      format: input.format,
      brandSlug: input.brandSlug,
      durationInFrames: template.durationInFrames,
      fps: template.fps
    }
  };
}
