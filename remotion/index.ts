import type { ComponentType } from "react";

import type { CreatorTemplateKey, CreatorVideoCompositionProps } from "@/lib/creator/types";

import { MusicTeaserComposition } from "@/remotion/compositions/music-teaser";
import { ServicePromoComposition } from "@/remotion/compositions/service-promo";

type RemotionCompositionDefinition = {
  id: string;
  component: ComponentType<CreatorVideoCompositionProps>;
};

export const creatorRemotionCompositions: Record<
  Extract<CreatorTemplateKey, "video_service_promo" | "video_music_teaser">,
  RemotionCompositionDefinition
> = {
  video_service_promo: {
    id: "creator-service-promo",
    component: ServicePromoComposition
  },
  video_music_teaser: {
    id: "creator-music-teaser",
    component: MusicTeaserComposition
  }
};
