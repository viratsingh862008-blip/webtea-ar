import { useMemo, useState } from "react";
import type { ARMode, ExperienceConfig } from "../types/experience";
import { buildStudioUrl, canGenerateQr } from "../lib/studio";
import { createQrDataUrl } from "../lib/qr";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=900&q=85";
const DEFAULT_DESTINATION = "https://example.com/";

function downloadText(filename: string, value: string): void {
  const blob = new Blob([value], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function Studio() {
  const [config, setConfig] = useState<ExperienceConfig>({
    id: "menu-01",
    title: "Your AR Menu",
    subtitle: "Tap the floating image to continue.",
    imageUrl: DEFAULT_IMAGE,
    destinationUrl: DEFAULT_DESTINATION,
    mode: "qr",
    theme: "editorial",
    ctaLabel: "Open menu",
    fallbackEnabled: true,
  });
  const [imagePreview, setImagePreview] = useState(DEFAULT_IMAGE);
  const [qr, setQr] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const experienceUrl = useMemo(
    () => buildStudioUrl(window.location.origin, { ...config, id: config.id || "experience" }),
    [config],
  );

  const qrReady = canGenerateQr(config, experienceUrl);

  async function generateQr() {
    if (!qrReady) {
      setError("Use a public image URL, valid destination URL, and a compact experience URL before generating the QR.");
      setQr("");
      return;
    }
    try {
      setError("");
      setQr(await createQrDataUrl(experienceUrl));
      setStatus("QR generated.");
    } catch {
      setError("QR generation failed.");
    }
  }

  function handleImageFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose a JPG, PNG, WebP, or other browser-supported image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImagePreview(reader.result);
        setConfig((current) => ({ ...current, imageUrl: reader.result as string }));
        setQr("");
        setStatus("Local image loaded for preview.");
      }
    };
    reader.readAsDataURL(file);
  }

  function update<K extends keyof ExperienceConfig>(key: K, value: ExperienceConfig[K]) {
    setConfig((current) => ({ ...current, [key]: value }));
    setQr("");
    setError("");
    setStatus("");
  }

  function downloadConfig() {
    downloadText(
      `${config.id || "webtea-ar"}-experience.json`,
      JSON.stringify({ ...config, generatedAt: new Date().toISOString() }, null, 2),
    );
    setStatus("Configuration downloaded.");
  }

  return (
    <main className="studio-shell">
      <div className="studio">
        <header>
          <p className="eyebrow">WEBTEA HQ · AR STUDIO</p>
          <h1>Build a QR → AR experience.</h1>
          <p className="home-card__copy">
            Configure an experience, preview it, generate its share URL, and export
            the configuration. The engine itself stays self-hosted and free.
          </p>
        </header>

        <div className="studio-grid">
          <section className="panel">
            <h2>Experience</h2>

            <div className="field">
              <label htmlFor="experience-id">Experience ID</label>
              <input id="experience-id" value={config.id} onChange={(e) => update("id", e.target.value.replace(/[^a-zA-Z0-9-_]/g, "-"))} />
            </div>

            <div className="field">
              <label htmlFor="title">Title</label>
              <input id="title" value={config.title} onChange={(e) => update("title", e.target.value)} />
            </div>

            <div className="field">
              <label htmlFor="subtitle">Subtitle</label>
              <input id="subtitle" value={config.subtitle ?? ""} onChange={(e) => update("subtitle", e.target.value)} />
            </div>

            <div className="field">
              <label htmlFor="destination">Destination URL</label>
              <input id="destination" type="url" placeholder="https://your-menu.com/" value={config.destinationUrl} onChange={(e) => update("destinationUrl", e.target.value)} />
            </div>

            <div className="field">
              <label>AR mode</label>
              <select value={config.mode} onChange={(e) => update("mode", e.target.value as ARMode)}>
                <option value="qr">QR camera AR</option>
                <option value="image-target">Image-tracked AR</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="image-url">Image URL</label>
              <input id="image-url" type="url" placeholder="https://cdn.example.com/card.webp" value={config.imageUrl.startsWith("data:") ? "" : config.imageUrl} onChange={(e) => { update("imageUrl", e.target.value); setImagePreview(e.target.value || DEFAULT_IMAGE); }} />
            </div>

            <div className="field">
              <label htmlFor="image-file">Upload image for preview</label>
              <div className="file-drop">
                <input id="image-file" type="file" accept="image/*" onChange={(e) => handleImageFile(e.target.files?.[0])} />
                <label htmlFor="image-file" className="ui-button">Choose image</label>
                <div className="note">An uploaded local file is preview-only until you host it at a public URL.</div>
              </div>
            </div>

            {config.mode === "image-target" ? (
              <div className="field">
                <label htmlFor="target-url">MindAR .mind target URL</label>
                <input id="target-url" type="url" placeholder="https://your-domain.com/targets/menu.mind" value={config.targetUrl ?? ""} onChange={(e) => update("targetUrl", e.target.value)} />
              </div>
            ) : null}

            <div className="home-links">
              <button className="ui-button ui-button--primary" type="button" onClick={generateQr} disabled={!qrReady}>
                Generate QR
              </button>
              <button className="ui-button" type="button" onClick={downloadConfig}>
                Export config
              </button>
            </div>

            {status ? <p className="note">{status}</p> : null}
            {error ? <p className="error">{error}</p> : null}
          </section>

          <section className="panel">
            <h2>Preview & publish</h2>
            <div className="preview-stage">
              <img className="preview-card" src={imagePreview} alt="AR experience preview" />
            </div>

            <p className="note">Share URL</p>
            <div className="field">
              <input readOnly value={experienceUrl} aria-label="Share URL" />
            </div>

            {qr ? (
              <div className="qr-wrap">
                <img src={qr} alt="Generated QR code" />
                <a className="ui-link" href={qr} download={`${config.id || "webtea-ar"}-qr.png`}>Download QR PNG</a>
              </div>
            ) : (
              <p className="note">
                QR generation is intentionally blocked for oversized URLs and local
                file data URLs. For client deployment, host the image and keep the
                QR payload compact.
              </p>
            )}

            <a className="ui-link" href={experienceUrl} target="_blank" rel="noreferrer">
              Open experience URL
            </a>
          </section>
        </div>
      </div>
    </main>
  );
}
