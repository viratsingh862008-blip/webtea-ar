import { describe, expect, it, vi } from "vitest";
import { loadExperience } from "./loader";

describe("experience loader", () => {
  it("loads a static experience manifest by slug", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      id: "menu-01",
      title: "Menu",
      imageUrl: "/experiences/menu-01/card.webp",
      destinationUrl: "https://example.com/menu",
      mode: "qr",
    }), { status: 200 })));

    const result = await loadExperience("/ar/menu-01", "");
    expect(result?.id).toBe("menu-01");
    expect(result?.source).toBe("registry");
    vi.unstubAllGlobals();
  });

  it("returns null for missing manifests", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 404 })));
    await expect(loadExperience("/ar/missing", "")).resolves.toBeNull();
    vi.unstubAllGlobals();
  });
});
