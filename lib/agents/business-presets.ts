import type { BusinessPreset } from "@/lib/agents/types";

export const businessPresets: BusinessPreset[] = [
  {
    slug: "fee-the-developer",
    label: "Fee The Developer",
    description: "Website design, automation, AI systems, and software development services.",
    defaultGoals: [
      "promote website + automation services",
      "generate leads for website builds",
      "promote AI automation services"
    ],
    defaultCtas: [
      "Book a strategy session",
      "Start your build",
      "Automate your business"
    ]
  },
  {
    slug: "runners-circle",
    label: "Runners Circle",
    description: "Campaign and content operating system for brand growth.",
    defaultGoals: [
      "promote content operations system",
      "generate campaign content",
      "build audience engagement"
    ],
    defaultCtas: []
  },
  {
    slug: "vet-gang",
    label: "Vet Gang",
    description: "Veteran-owned business network and brand platform.",
    defaultGoals: [
      "promote veteran-owned business network",
      "spotlight a member business",
      "generate brand awareness"
    ],
    defaultCtas: []
  }
];

export function getBusinessPreset(slug: string) {
  return businessPresets.find((business) => business.slug === slug) ?? null;
}
