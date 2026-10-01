export function isSafeDestinationUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function buildExperienceUrl(origin: string, experienceId: string): string {
  const cleanOrigin = origin.replace(/\/$/, "");
  const cleanId = encodeURIComponent(experienceId.trim());
  return `${cleanOrigin}/ar/${cleanId}`;
}