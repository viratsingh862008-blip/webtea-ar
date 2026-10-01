import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QrAR } from "./QrAR";

vi.mock("../lib/camera", () => ({
  startEnvironmentCamera: vi.fn().mockResolvedValue({
    ok: false,
    message: "Camera permission was denied.",
  }),
  stopCamera: vi.fn(),
}));

describe("QrAR fallback", () => {
  it("keeps the linked destination reachable when camera start fails", async () => {
    render(
      <QrAR
        experience={{
          id: "menu-01",
          title: "Restaurant Menu",
          subtitle: "Tap to open.",
          imageUrl: "/menu.webp",
          destinationUrl: "https://example.com/menu",
          mode: "qr",
          ctaLabel: "Open menu",
          source: "registry",
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Start AR" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeTruthy();
      expect(screen.getByRole("link", { name: "Open linked experience" }).getAttribute("href"))
        .toBe("https://example.com/menu");
    });
  });
});
