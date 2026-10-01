import { describe, expect, it } from "vitest";
import { loadExternalScript } from "./cdn";

describe("external script loader", () => {
  it("deduplicates a script URL and resolves when the script loads", async () => {
    const first = loadExternalScript("https://cdn.example.com/aframe.js");
    const second = loadExternalScript("https://cdn.example.com/aframe.js");

    expect(first).toBe(second);
    const scripts = document.querySelectorAll('script[src="https://cdn.example.com/aframe.js"]');
    expect(scripts.length).toBe(1);

    (scripts[0] as HTMLScriptElement).dispatchEvent(new Event("load"));
    await expect(first).resolves.toBeUndefined();
  });

  it("rejects when a script fails to load", async () => {
    const promise = loadExternalScript("https://cdn.example.com/mindar.js");
    const script = document.querySelector('script[src="https://cdn.example.com/mindar.js"]') as HTMLScriptElement;
    script.dispatchEvent(new Event("error"));
    await expect(promise).rejects.toThrow(/failed to load/i);
  });
});
