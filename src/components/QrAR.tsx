import { useCallback, useEffect, useRef, useState } from "react";
import type { ExperienceRuntimeConfig } from "../types/experience";
import { startEnvironmentCamera, stopCamera } from "../lib/camera";

interface QrARProps {
  experience: ExperienceRuntimeConfig;
}

export function QrAR({ experience }: QrARProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLButtonElement>(null);
  const [status, setStatus] = useState<"idle" | "starting" | "ready" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const handlePointer = (event: PointerEvent) => {
      const card = cardRef.current;
      if (!card) return;
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;
      card.style.setProperty("--tilt-x", `${(-y * 2.8).toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${(x * 3.2).toFixed(2)}deg`);
    };

    window.addEventListener("pointermove", handlePointer, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointer);
  }, []);

  useEffect(() => {
    return () => {
      const stream = videoRef.current?.srcObject;
      stopCamera(stream instanceof MediaStream ? stream : null);
    };
  }, []);

  const openDestination = useCallback(() => {
    window.location.assign(experience.destinationUrl);
  }, [experience.destinationUrl]);

  const start = useCallback(async () => {
    setStatus("starting");
    setError("");

    const result = await startEnvironmentCamera();
    if (!result.ok) {
      setStatus("error");
      setError(result.message);
      return;
    }

    const video = videoRef.current;
    if (!video) {
      stopCamera(result.stream);
      setStatus("error");
      setError("Camera view could not be attached.");
      return;
    }

    video.srcObject = result.stream;
    try {
      await video.play();
      setStatus("ready");
    } catch {
      stopCamera(result.stream);
      setStatus("error");
      setError("The camera started but the preview could not play. Try again.");
    }
  }, []);

  return (
    <main className="ar-shell">
      <video ref={videoRef} className="ar-video" playsInline muted aria-label="Live camera view" />
      <div className="ar-dim" aria-hidden="true" />

      <div className="ar-ui">
        <div className="ar-top">
          <span className="ar-brand">WebTea AR</span>
          <button className="ar-close" type="button" onClick={() => window.history.back()} aria-label="Close AR">
            ×
          </button>
        </div>

        <div className="ar-center">
          {status === "ready" ? (
            <button
              ref={cardRef}
              className="ar-card-button"
              type="button"
              onClick={openDestination}
              aria-label={experience.ctaLabel ?? "Open experience"}
            >
              <img className="ar-card-image" src={experience.imageUrl} alt="" />
            </button>
          ) : (
            <section className="permission-card" aria-live="polite">
              <p className="eyebrow">QR → AR</p>
              <h2>{experience.title}</h2>
              <p>
                Start the camera to reveal the interactive floating image. Tap the image
                to open the linked experience.
              </p>
              {error ? <p className="error">{error}</p> : null}
              <button className="ui-button ui-button--primary" type="button" onClick={start} disabled={status === "starting"}>
                {status === "starting" ? "Starting camera…" : "Start AR"}
              </button>
            </section>
          )}
        </div>

        {status === "ready" ? (
          <div className="ar-bottom">
            <div className="ar-title">{experience.title}</div>
            {experience.subtitle ? <div className="ar-subtitle">{experience.subtitle}</div> : null}
            <button className="ar-cta" type="button" onClick={openDestination}>
              {experience.ctaLabel ?? "Tap to open"}
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
