import { useEffect, useRef, useState } from "react";
import type { ExperienceRuntimeConfig } from "../types/experience";

interface ImageTargetARProps {
  experience: ExperienceRuntimeConfig;
}

export function ImageTargetAR({ experience }: ImageTargetARProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "scanning" | "found" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let disposed = false;
    let scene: HTMLElement | null = null;

    const mount = async () => {
      try {
        if (!experience.targetUrl) throw new Error("No MindAR target has been configured.");

        await import("aframe");
        await import("mind-ar/dist/mindar-image-aframe.prod.js");

        if (disposed || !hostRef.current) return;

        scene = document.createElement("a-scene");
        scene.setAttribute(
          "mindar-image",
          [
            `imageTargetSrc: ${experience.targetUrl}`,
            "autoStart: true",
            "maxTrack: 1",
            "uiLoading: no",
            "uiScanning: no",
            "uiError: no",
          ].join("; "),
        );
        scene.setAttribute("color-space", "sRGB");
        scene.setAttribute("renderer", "colorManagement: true; physicallyCorrectLights: true");
        scene.setAttribute("vr-mode-ui", "enabled: false");
        scene.setAttribute("device-orientation-permission-ui", "enabled: false");
        scene.setAttribute("embedded", "true");

        const assets = document.createElement("a-assets");
        const image = document.createElement("img");
        image.id = "ar-target-card";
        image.crossOrigin = "anonymous";
        image.src = experience.imageUrl;
        assets.appendChild(image);

        const camera = document.createElement("a-camera");
        camera.setAttribute("position", "0 0 0");
        camera.setAttribute("look-controls", "enabled: false");

        const cursor = document.createElement("a-cursor");
        cursor.setAttribute("cursor", "rayOrigin: mouse; fuse: false");
        cursor.setAttribute("raycaster", "objects: .ar-clickable; far: 20");
        camera.appendChild(cursor);

        const target = document.createElement("a-entity");
        target.setAttribute("mindar-image-target", "targetIndex: 0");

        const backing = document.createElement("a-plane");
        backing.setAttribute("position", "0 0 -0.025");
        backing.setAttribute("width", "0.82");
        backing.setAttribute("height", "1.08");
        backing.setAttribute("material", "color: #0b0b09; opacity: 0.82; shader: flat; transparent: true");

        const card = document.createElement("a-plane");
        card.classList.add("ar-clickable");
        card.setAttribute("position", "0 0 0.04");
        card.setAttribute("width", "0.76");
        card.setAttribute("height", "1");
        card.setAttribute("material", "src: #ar-target-card; shader: flat; transparent: true");
        card.setAttribute(
          "animation__float",
          "property: position; to: 0 0.035 0.04; dir: alternate; dur: 1700; loop: true; easing: easeInOutSine",
        );
        card.addEventListener("click", () => window.location.assign(experience.destinationUrl));

        target.appendChild(backing);
        target.appendChild(card);
        scene.appendChild(assets);
        scene.appendChild(camera);
        scene.appendChild(target);
        hostRef.current.appendChild(scene);

        scene.addEventListener("arReady", () => {
          if (!disposed) setStatus("scanning");
        });
        scene.addEventListener("arError", () => {
          if (!disposed) {
            setStatus("error");
            setError("AR camera initialization failed. Check camera permission and target hosting.");
          }
        });
        target.addEventListener("targetFound", () => {
          if (!disposed) setStatus("found");
        });
        target.addEventListener("targetLost", () => {
          if (!disposed) setStatus("scanning");
        });
      } catch (cause) {
        if (!disposed) {
          setStatus("error");
          setError(cause instanceof Error ? cause.message : "Unable to initialize image-tracked AR.");
        }
      }
    };

    void mount();

    return () => {
      disposed = true;
      try {
        const system = (scene as (HTMLElement & {
          systems?: Record<string, { stop?: () => void }>;
        } | null))?.systems?.["mindar-image-system"];
        system?.stop?.();
      } catch {
        // MindAR may already have released camera resources.
      }
      scene?.remove();
    };
  }, [experience.destinationUrl, experience.imageUrl, experience.targetUrl]);

  const stateText = status === "found"
    ? "Target found · tap the image"
    : status === "scanning"
      ? "Point the camera at the target image"
      : status === "loading"
        ? "Starting AR…"
        : "AR could not start";

  return (
    <main className="ar-shell ar-shell--target">
      <div ref={hostRef} className="ar-scene-host" />
      <div className="ar-ui">
        <div className="ar-top">
          <span className="ar-brand">WebTea AR · Image Tracking</span>
          <button className="ar-close" type="button" onClick={() => window.history.back()} aria-label="Close AR">×</button>
        </div>

        <div className="ar-center">
          {status === "error" ? (
            <section className="ar-error" role="alert">
              <p className="eyebrow">AR ERROR</p>
              <h2>We could not start this experience.</h2>
              <p>{error}</p>
              <a className="ui-link ui-button--primary" href={experience.destinationUrl}>Open destination</a>
            </section>
          ) : (
            <div className={`ar-hint ${status === "found" ? "is-hidden" : ""}`} aria-live="polite">
              {stateText}
            </div>
          )}
        </div>

        <div className="ar-bottom">
          <div className="ar-title">{experience.title}</div>
          {experience.subtitle ? <div className="ar-subtitle">{experience.subtitle}</div> : null}
          {status === "found" ? (
            <button className="ar-cta" type="button" onClick={() => window.location.assign(experience.destinationUrl)}>
              {experience.ctaLabel ?? "Tap to open"}
            </button>
          ) : null}
        </div>
      </div>
    </main>
  );
}
