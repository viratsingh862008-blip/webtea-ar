import type { ExperienceConfig, ExperienceRuntimeConfig } from "../types/experience";

const HTTP_PROTOCOLS = new Set(["http:", "https:"]);

export function isSafeDestinationUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return HTTP_PROTOCOLS.has(url.protocol);
  } catch {
    return false;
  }
}

export function isSafeAssetUrl(value: string): boolean {
  try {
    const url = new URL(value, window.location.origin);
    return HTTP_PROTOCOLS.has(url.protocol)
      || (url.protocol === "data:" && value.toLowerCase().startsWith("data:image/"));
  } catch {
    return false;
  }
}

function cleanText(value: string | null | undefined, fallback: string): string {
  const normalized = value?.trim();
  return normalized ? normalized.slice(0, 180) : fallback;
}

export function buildExperienceUrl(origin: string, experienceId: string): string {
  const cleanOrigin = origin.replace(/\/$/, "");
  const cleanId = encodeURIComponent(experienceId.trim());
  return `${cleanOrigin}/ar/${cleanId}`;
}

export function buildQueryExperienceUrl(
  origin: string,
  config: Pick<ExperienceConfig, "id" | "title" | "imageUrl" | "destinationUrl" | "mode" | "targetUrl">,
): string {
  const url = new URL(buildExperienceUrl(origin, config.id));
  url.searchParams.set("image", config.imageUrl);
  url.searchParams.set("href", config.destinationUrl);
  url.searchParams.set("title", config.title);
  url.searchParams.set("mode", config.mode);
  if (config.targetUrl) url.searchParams.set("target", config.targetUrl);
  return url.toString();
}

export function normalizeExperience(
  config: ExperienceConfig,
  source: ExperienceRuntimeConfig["source"],
): ExperienceRuntimeConfig {
  if (!config.id.trim()) throw new Error("Experience id is required.");
  if (config.mode !== "qr" && config.mode !== "image-target") {
    throw new Error("Unsupported AR mode.");
  }
  if (!isSafeDestinationUrl(config.destinationUrl)) {
    throw new Error("Destination URL must be a valid HTTP(S) URL.");
  }
  if (!isSafeAssetUrl(config.imageUrl)) {
    throw new Error("Image URL must be a valid HTTP(S) or data URL.");
  }
  if (config.mode === "image-target") {
    if (!config.targetUrl) {
      throw new Error("Image-target mode requires a .mind target URL.");
    }
    if (!isSafeAssetUrl(config.targetUrl)) {
      throw new Error("Image target URL must be a safe HTTP(S) or same-origin asset URL.");
    }
  }

  return {
    ...config,
    id: config.id.trim(),
    title: cleanText(config.title, "WebTea AR"),
    subtitle: config.subtitle?.trim().slice(0, 240),
    ctaLabel: cleanText(config.ctaLabel, "Open experience"),
    source,
  };
}

export function parseQueryExperience(search: string): ExperienceRuntimeConfig | null {
  const params = new URLSearchParams(search);
  const imageUrl = params.get("image");
  const destinationUrl = params.get("href");

  if (!imageUrl || !destinationUrl) return null;

  const mode = params.get("mode") === "image-target" ? "image-target" : "qr";
  const targetUrl = params.get("target") || undefined;

  try {
    return normalizeExperience(
      {
        id: params.get("id") || "query-experience",
        title: params.get("title") || "WebTea AR",
        subtitle: params.get("subtitle") || undefined,
        imageUrl,
        destinationUrl,
        mode,
        targetUrl,
        theme: params.get("theme") === "minimal" ? "minimal" : "editorial",
        ctaLabel: params.get("cta") || "Tap to open",
        fallbackEnabled: true,
      },
      "query",
    );
  } catch {
    return null;
  }
}

export function getRuntimeExperience(
  pathname: string,
  search: string,
  lookup: (id: string) => ExperienceConfig | null,
): ExperienceRuntimeConfig | null {
  const queryExperience = parseQueryExperience(search);
  if (queryExperience) return queryExperience;

  const match = pathname.match(/^\/ar\/([^/]+)\/?$/);
  if (!match) return null;

  const id = decodeURIComponent(match[1]);
  const registryExperience = lookup(id);
  if (!registryExperience) return null;

  try {
    return normalizeExperience(registryExperience, "registry");
  } catch {
    return null;
  }
}
