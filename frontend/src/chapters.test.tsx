import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { StoreProvider } from "./store";
vi.mock("@gsap/react", () => ({
  useGSAP: () => ({ contextSafe: (fn: unknown) => fn }),
}));
import Home from "./Home";
describe("material chapter navigation", () => {
  it("changes the visible story and selected tab using touch-friendly controls", () => {
    render(
      <MemoryRouter>
        <StoreProvider>
          <Home />
        </StoreProvider>
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: "A feeling." })).toBeTruthy();
    const polki = screen.getByRole("tab", { name: "The soul of polki" });
    fireEvent.click(polki);
    expect(polki.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("heading", { name: "A memory." })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "A feeling." })).toBe(null);
    expect(
      screen
        .getByRole("link", { name: "Discover the heritage edit" })
        .getAttribute("href"),
    ).toBe("/collections/heritage");
  });
  it("supports arrow-key navigation between stories and moves focus with selection", () => {
    render(
      <MemoryRouter>
        <StoreProvider>
          <Home />
        </StoreProvider>
      </MemoryRouter>,
    );
    fireEvent.keyDown(screen.getByRole("tab", { name: "The warmth of gold" }), {
      key: "ArrowRight",
    });
    expect(screen.getByRole("heading", { name: "A memory." })).toBeTruthy();
    expect(document.activeElement).toBe(
      screen.getByRole("tab", { name: "The soul of polki" }),
    );
    fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
    expect(
      screen.getByRole("heading", { name: "A possibility." }),
    ).toBeTruthy();
  });
});
