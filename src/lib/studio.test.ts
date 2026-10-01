import { describe, expect, it } from "vitest";
import { buildPublishedUrl, buildStudioUrl, canGenerateQr } from "./studio";

describe("studio publishing helpers", () => {
  const config = {
    id: "menu-01",
    title: "Restaurant Menu",
    imageUrl: "/experiences/menu-01/card.webp",
    destinationUrl: "https://example.com/menu",
    mode: "qr" as const,
  };

  it("builds a short published URL", () => {
    expect(buildPublishedUrl("https://ar.example.com/", "menu 01"))
      .toBe("https://ar.example.com/ar/menu%2001");
  });

  it("builds a shareable query preview URL", () => {
    const url = buildStudioUrl("https://ar.example.com", { ...config, imageUrl: "https://cdn.example.com/menu.webp" });
    expect(url).toContain("/ar/menu-01?");
    expect(url).toContain("image=");
    expect(url).toContain("href=");
  });

  it("accepts a compact published URL for QR generation", () => {
    const url = buildPublishedUrl("https://ar.example.com", "menu-01");
    expect(canGenerateQr(config, url)).toBe(true);
  });

  it("protects QR generation from oversized payloads", () => {
    expect(canGenerateQr(config, "https://ar.example.com/".padEnd(1801, "x"))).toBe(false);
  });
});
