import type { ExperienceRuntimeConfig } from "../types/experience";
import { ImageTargetAR } from "./ImageTargetAR";
import { QrAR } from "./QrAR";

interface ARExperienceProps {
  experience: ExperienceRuntimeConfig;
}

export function ARExperience({ experience }: ARExperienceProps) {
  return experience.mode === "image-target"
    ? <ImageTargetAR experience={experience} />
    : <QrAR experience={experience} />;
}
