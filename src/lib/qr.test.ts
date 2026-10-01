import { describe, expect, it, vi } from "vitest";
import { createQrDataUrl } from "./qr";

vi.mock("qrcode", () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue("data:image/png;base64,QR"),
  },
}));

describe("QR generation", () => {
  it("creates a high-error-correction PNG data URL", async () => {
    const result = await createQrDataUrl("https://example.com/ar/demo", 512);
    expect(result).toBe("data:image/png;base64,QR");
  });
});
