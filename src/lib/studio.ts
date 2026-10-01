import type { ExperienceConfig } from "../types/experience";
import { buildQueryExperienceUrl, isSafeAssetUrl, isSafeDestinationUrl } from "./experience";

export function canGenerateQr(
  config: Pick<ExperienceConfig, "imageUrl" | "destinationUrl" | "mode" | "targetUrl">,
  experienceUrl: string,
): boolean {
  const targetReady = config.mode !== "image-target" || Boolean(config.targetUrl);
  return isSafeAssetUrl(config.imageUrl)
    && isSafeDestinationUrl(config.destinationUrl)
    && targetReady
    && experienceUrl.length <= 1800;
}

export function buildStudioUrl(
  origin: string,
  config: Pick<ExperienceConfig, "id" | "title" | "imageUrl" | "destinationUrl" | "mode" | "targetUrl">,
): string {
  return buildQueryExperienceUrl(origin, config);
}
