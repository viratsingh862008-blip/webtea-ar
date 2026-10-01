import type { ExperienceConfig, ExperienceRuntimeConfig } from "../types/experience";
import { normalizeExperience, parseQueryExperience } from "./experience";

export async function loadExperience(
  pathname: string,
  search: string,
  signal?: AbortSignal,
): Promise<ExperienceRuntimeConfig | null> {
  const queryExperience = parseQueryExperience(search);
  if (queryExperience) return queryExperience;

  const match = pathname.match(/^\/ar\/([^/]+)\/?$/);
  if (!match) return null;

  const id = decodeURIComponent(match[1]);
  if (!/^[a-zA-Z0-9_-]{1,80}$/.test(id)) return null;

  try {
    const response = await fetch(`/experiences/${encodeURIComponent(id)}/experience.json`, {
      signal,
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;

    const config = await response.json() as ExperienceConfig;
    return normalizeExperience(config, "registry");
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    return null;
  }
}
