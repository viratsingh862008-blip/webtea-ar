import { afterEach, describe, expect, it, vi } from "vitest";
import { loadExternalScript } from "./cdn";

afterEach(() => {
  vi.unstubAllGlobals();
});

function installFakeDocument() {
  type FakeScript = {
    src: string;
    dataset: Record<string, string>;
    listeners: Record<string, () => void>;
    addEventListener: (type: string, fn: () => void) => void;
    getAttribute: (name: string) => string | null;
  };

  const scripts: FakeScript[] = [];
  const fakeDocument: {
    scripts: FakeScript[];
    createElement: ReturnType<typeof vi.fn>;
    head: { appendChild: ReturnType<typeof vi.fn> };
  } = {
    scripts,
    createElement: vi.fn(),
    head: { appendChild: vi.fn() },
  };

  fakeDocument.createElement.mockImplementation(() => {
    const element: FakeScript = {
      src: "",
      dataset: {},
      listeners: {},
      addEventListener(type, fn) {
        this.listeners[type] = fn;
      },
      getAttribute(name) {
        return name === "src" ? this.src : null;
      },
    };
    scripts.push(element);
    return element;
  });

  fakeDocument.head.appendChild.mockImplementation((element: FakeScript) => element);

  vi.stubGlobal("document", fakeDocument);
  return fakeDocument;
}

describe("external script loader", () => {
  it("deduplicates a script URL and resolves when the script loads", async () => {
    const fakeDocument = installFakeDocument();
    const first = loadExternalScript("https://cdn.example.com/aframe.js");
    const second = loadExternalScript("https://cdn.example.com/aframe.js");

    expect(first).toBe(second);
    expect(fakeDocument.scripts).toHaveLength(1);

    fakeDocument.scripts[0].listeners.load?.();
    await expect(first).resolves.toBeUndefined();
  });

  it("rejects when a script fails to load", async () => {
    const fakeDocument = installFakeDocument();
    const promise = loadExternalScript("https://cdn.example.com/mindar.js");
    fakeDocument.scripts[0].listeners.error?.();
    await expect(promise).rejects.toThrow(/failed to load/i);
  });
});
