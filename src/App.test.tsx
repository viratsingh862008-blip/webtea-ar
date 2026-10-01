import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("WebTea AR landing page", () => {
  it("explains the scan-to-AR experience", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: /webtea ar/i })).toBeTruthy();
    expect(screen.getByText(/scan.*experience/i)).toBeTruthy();
  });
});