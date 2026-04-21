import type { CreatorTemplateDefinition, CreatorTemplateKey, CreatorRequestTypeValue } from "@/lib/creator/types";

export const creatorTemplates: CreatorTemplateDefinition[] = [
  {
    key: "image_offer_card",
    type: "IMAGE",
    label: "Image Offer Card",
    description: "High-contrast promotional card for offers, launches, and service hooks.",
    aspectRatio: "4:5",
    dimensions: {
      width: 1080,
      height: 1350
    },
    requiredFields: ["headline", "body", "cta"],
    recommendedFormat: "Promotional social card"
  },
  {
    key: "image_quote_card",
    type: "IMAGE",
    label: "Image Quote Card",
    description: "Editorial pull-quote layout for authority moments, testimonials, and founder lines.",
    aspectRatio: "1:1",
    dimensions: {
      width: 1080,
      height: 1080
    },
    requiredFields: ["headline", "body"],
    recommendedFormat: "Square quote graphic"
  },
  {
    key: "video_service_promo",
    type: "VIDEO",
    label: "Video Service Promo",
    description: "Vertical promo sequence for service businesses, offer pushes, and appointment CTAs.",
    aspectRatio: "9:16",
    dimensions: {
      width: 1080,
      height: 1920
    },
    requiredFields: ["headline", "body", "cta"],
    recommendedFormat: "Vertical promo reel",
    durationInFrames: 180,
    fps: 30
  },
  {
    key: "video_music_teaser",
    type: "VIDEO",
    label: "Video Music Teaser",
    description: "High-energy teaser composition for track drops, live sessions, and artist announcements.",
    aspectRatio: "9:16",
    dimensions: {
      width: 1080,
      height: 1920
    },
    requiredFields: ["headline", "body", "cta"],
    recommendedFormat: "Vertical music teaser",
    durationInFrames: 210,
    fps: 30
  }
];

export function getCreatorTemplate(key: CreatorTemplateKey) {
  return creatorTemplates.find((template) => template.key === key) ?? null;
}

export function listTemplatesForType(type: CreatorRequestTypeValue) {
  return creatorTemplates.filter((template) => template.type === type);
}
