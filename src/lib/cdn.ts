const pendingScripts = new Map<string, Promise<void>>();

export function loadExternalScript(src: string): Promise<void> {
  const existing = pendingScripts.get(src);
  if (existing) return existing;

  const promise = new Promise<void>((resolve, reject) => {
    const current = Array.from(document.scripts).find(
      (script) => script.src === src || script.getAttribute("src") === src,
    ) ?? null;
    if (current) {
      if (current.dataset.loaded === "true") {
        resolve();
        return;
      }

      current.addEventListener("load", () => resolve(), { once: true });
      current.addEventListener("error", () => reject(new Error(`Failed to load script: ${src}`)), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.dataset.webteaExternal = "true";
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    }, { once: true });
    script.addEventListener("error", () => {
      pendingScripts.delete(src);
      reject(new Error(`Failed to load script: ${src}`));
    }, { once: true });
    document.head.appendChild(script);
  });

  pendingScripts.set(src, promise);
  return promise;
}

export const AFRAME_RUNTIME_URL = "https://aframe.io/releases/1.5.0/aframe.min.js";
export const MINDAR_IMAGE_AFRAME_RUNTIME_URL =
  "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js";
