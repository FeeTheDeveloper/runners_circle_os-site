import type { BrandKit } from "@/lib/creator/types";

export const brandKits: BrandKit[] = [
  {
    slug: "runners-circle",
    label: "Runners Circle",
    description: "Aggressive performance-forward palette for premium service launches and operator-led campaigns.",
    logoText: "RUNNERS CIRCLE",
    colors: {
      background: "#050816",
      surface: "#0f172a",
      foreground: "#f8fafc",
      muted: "#cbd5e1",
      primary: "#38bdf8",
      secondary: "#7c3aed",
      accent: "#f97316"
    }
  },
  {
    slug: "summit-service",
    label: "Summit Service Co.",
    description: "High-trust home-service visual system with sharp contrast and clean conversion-focused hierarchy.",
    logoText: "SUMMIT SERVICE",
    colors: {
      background: "#07111f",
      surface: "#132238",
      foreground: "#f8fafc",
      muted: "#dbe4f0",
      primary: "#22c55e",
      secondary: "#0ea5e9",
      accent: "#facc15"
    }
  },
  {
    slug: "nightshift-music",
    label: "Nightshift Music",
    description: "Moody, cinematic tones designed for artist promos, teaser drops, and release countdowns.",
    logoText: "NIGHTSHIFT",
    colors: {
      background: "#0b0414",
      surface: "#1a0f2f",
      foreground: "#faf5ff",
      muted: "#e9d5ff",
      primary: "#f472b6",
      secondary: "#8b5cf6",
      accent: "#f59e0b"
    }
  }
];

export function getBrandKit(slug: string) {
  return brandKits.find((brand) => brand.slug === slug) ?? brandKits[0];
}
