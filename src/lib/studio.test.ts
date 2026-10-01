import { describe, expect, it } from "vitest";
import { buildStudioUrl, canGenerateQr } from "./studio";

describe("studio publishing helpers", () => {
  const config = {
    id: "menu-01",
    title: "Restaurant Menu",
    imageUrl: "https://cdn.example.com/menu.webp",
    destinationUrl: "https://example.com/menu",
    mode: "qr" as const,
  };

  it("builds a shareable query experience URL", () => {
    const url = buildStudioUrl("https://ar.example.com", config);
    expect(url).toContain("/ar/menu-01?");
    expect(url).toContain("image=");
    expect(url).toContain("href=");
  });

  it("accepts a normal QR experience URL for QR generation", () => {
    const url = buildStudioUrl("https://ar.example.com", config);
    expect(canGenerateQr(config, url)).toBe(true);
  });

  it("protects QR generation from oversized payloads", () => {
    expect(canGenerateQr(config, "https://ar.example.com/".padEnd(1801, "x"))).toBe(false);
  });
});
