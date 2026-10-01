export type ARMode = "qr" | "image-target";

export interface ExperienceConfig {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  destinationUrl: string;
  mode: ARMode;
  targetUrl?: string;
  theme?: "editorial" | "minimal" | "glass";
  ctaLabel?: string;
  fallbackEnabled?: boolean;
}

export interface ExperienceRuntimeConfig extends ExperienceConfig {
  source: "registry" | "query";
}
