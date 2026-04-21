import type { CreatorVideoCompositionProps } from "@/lib/creator/types";

export function MusicTeaserComposition({
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
        background: `radial-gradient(circle at 20% 20%, ${brand.colors.primary}40 0%, ${brand.colors.surface} 34%, ${brand.colors.background} 100%)`,
        color: brand.colors.foreground,
        display: "grid",
        gridTemplateRows: "1fr auto",
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        padding: 72,
        fontFamily: "Arial, sans-serif"
      }}
    >
      <div style={{ display: "grid", alignContent: "space-between" }}>
        <div
          style={{
            display: "inline-flex",
            width: "fit-content",
            borderRadius: 999,
            background: `${brand.colors.surface}dd`,
            border: `1px solid ${brand.colors.accent}66`,
            color: brand.colors.accent,
            padding: "14px 24px",
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 3
          }}
        >
          {accentText || "New release"}
        </div>

        <div style={{ marginTop: 82 }}>
          <h1
            style={{
              fontSize: 118,
              lineHeight: 0.98,
              fontWeight: 900,
              margin: 0,
              maxWidth: 860
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
              margin: "34px 0 0"
            }}
          >
            {body}
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gap: 24,
          alignSelf: "end"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            color: brand.colors.primary,
            fontSize: 30,
            fontWeight: 700
          }}
        >
          <span>{platform}</span>
          <span>{brand.logoText}</span>
        </div>
        <div
          style={{
            borderRadius: 34,
            border: `2px solid ${brand.colors.foreground}`,
            padding: "28px 34px",
            fontSize: 34,
            fontWeight: 800
          }}
        >
          {cta}
        </div>
      </div>
    </div>
  );
}
