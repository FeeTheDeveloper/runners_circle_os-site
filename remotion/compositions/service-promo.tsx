import type { CreatorVideoCompositionProps } from "@/lib/creator/types";

export function ServicePromoComposition({
  headline,
  body,
  cta,
  accentText,
  brand,
  platform
}: CreatorVideoCompositionProps) {
  return (
    <div
      style={{
        background: `linear-gradient(145deg, ${brand.colors.background} 0%, ${brand.colors.surface} 55%, ${brand.colors.secondary} 100%)`,
        color: brand.colors.foreground,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        padding: 72,
        fontFamily: "Arial, sans-serif"
      }}
    >
      <div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 16,
            borderRadius: 999,
            border: `1px solid ${brand.colors.primary}55`,
            background: `${brand.colors.surface}aa`,
            padding: "16px 26px",
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 2
          }}
        >
          <span>{brand.logoText}</span>
          <span style={{ color: brand.colors.primary }}>{platform}</span>
        </div>
        <h1
          style={{
            fontSize: 106,
            lineHeight: 1.02,
            fontWeight: 800,
            margin: "72px 0 28px"
          }}
        >
          {headline}
        </h1>
        <p
          style={{
            fontSize: 40,
            lineHeight: 1.45,
            color: brand.colors.muted,
            maxWidth: 820,
            margin: 0
          }}
        >
          {body}
        </p>
      </div>

      <div style={{ display: "grid", gap: 24 }}>
        <div
          style={{
            display: "inline-flex",
            width: "fit-content",
            borderRadius: 32,
            background: brand.colors.foreground,
            color: brand.colors.background,
            padding: "26px 34px",
            fontSize: 34,
            fontWeight: 800
          }}
        >
          {cta}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            fontSize: 28,
            fontWeight: 700,
            color: brand.colors.primary
          }}
        >
          <span>{accentText || "Built for fast operator approvals"}</span>
          <span style={{ color: brand.colors.muted }}>{brand.label}</span>
        </div>
      </div>
    </div>
  );
}
