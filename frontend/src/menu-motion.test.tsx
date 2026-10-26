import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { StoreProvider } from "./store";
import { Header } from "./Navigation";

vi.mock("motion/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("motion/react")>()),
  useReducedMotion: () => false,
}));

function app() {
  return render(
    <MemoryRouter>
      <StoreProvider>
        <Header />
      </StoreProvider>
    </MemoryRouter>,
  );
}

describe("animated menu lifecycle", () => {
  it("keeps the dialog and scroll lock until the exit finishes, then supports reopening", async () => {
    app();
    const opener = screen.getByRole("button", { name: "Open menu" });
    fireEvent.click(opener);
    const menu = screen.getByRole("dialog", { name: "Explore Ornate" });
    fireEvent.click(screen.getByRole("button", { name: "Close navigation" }));
    expect(menu.classList.contains("is-closing")).toBe(true);
    expect(menu.hasAttribute("open")).toBe(true);
    expect(document.body.style.overflow).toBe("hidden");
    await waitFor(() => expect(menu.hasAttribute("open")).toBe(false));
    expect(document.body.style.overflow).not.toBe("hidden");
    fireEvent.click(opener);
    expect(menu.classList.contains("is-closing")).toBe(false);
    expect(menu.hasAttribute("open")).toBe(true);
  });
  it("cancels a pending exit and restores body scrolling on unmount", () => {
    const view = app();
    const opener = screen.getByRole("button", { name: "Open menu" });
    fireEvent.click(opener);
    const menu = screen.getByRole("dialog", { name: "Explore Ornate" });
    fireEvent.click(screen.getByRole("button", { name: "Close navigation" }));
    fireEvent.click(opener);
    expect(menu.hasAttribute("open")).toBe(true);
    expect(menu.classList.contains("is-closing")).toBe(false);
    view.unmount();
    expect(document.body.style.overflow).not.toBe("hidden");
  });
});
