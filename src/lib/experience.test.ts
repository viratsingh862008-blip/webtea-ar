import { describe, expect, it } from "vitest";
import { buildExperienceUrl, isSafeDestinationUrl } from "./experience";

describe("WebTea AR experience configuration", () => {
  it("accepts HTTPS destinations", () => {
    expect(isSafeDestinationUrl("https://example.com/menu")).toBe(true);
  });

  it("rejects non-web destinations", () => {
    expect(isSafeDestinationUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeDestinationUrl("not-a-url")).toBe(false);
  });

  it("builds a stable AR experience URL", () => {
    expect(buildExperienceUrl("https://webtea-ar.vercel.app", "restaurant-01"))
      .toBe("https://webtea-ar.vercel.app/ar/restaurant-01");
  });
});