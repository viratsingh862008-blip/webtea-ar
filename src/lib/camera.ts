export type CameraStartResult =
  | { ok: true; stream: MediaStream }
  | { ok: false; message: string };

export function isCameraSupported(): boolean {
  return typeof navigator !== "undefined"
    && Boolean(navigator.mediaDevices?.getUserMedia)
    && typeof window !== "undefined"
    && window.isSecureContext;
}

export async function startEnvironmentCamera(): Promise<CameraStartResult> {
  if (!isCameraSupported()) {
    return {
      ok: false,
      message: "Camera access requires a supported browser on HTTPS (or localhost).",
    };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    });
    return { ok: true, stream };
  } catch (error) {
    const name = error instanceof DOMException ? error.name : "";
    if (name === "NotAllowedError" || name === "PermissionDeniedError") {
      return { ok: false, message: "Camera permission was denied. Enable camera access in your browser settings and try again." };
    }
    if (name === "NotFoundError") {
      return { ok: false, message: "No usable camera was found on this device." };
    }
    return { ok: false, message: "The camera could not be started. Close other camera apps and try again." };
  }
}

export function stopCamera(stream: MediaStream | null): void {
  stream?.getTracks().forEach((track) => track.stop());
}
