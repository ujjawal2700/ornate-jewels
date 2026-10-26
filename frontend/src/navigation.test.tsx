import { describe, it, expect } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { StoreProvider } from "./store";
import { Header } from "./Navigation";
function renderNavigation() {
  return render(
    <MemoryRouter>
      <StoreProvider>
        <Header />
        <Routes>
          <Route path="/" element={<h1>Home page</h1>} />
          <Route path="/shop/earrings" element={<h1>Earrings collection</h1>} />
          <Route path="/search" element={<h1>Search results</h1>} />
        </Routes>
      </StoreProvider>
    </MemoryRouter>,
  );
}
describe("redesigned navigation", () => {
  it("opens a modal menu, exposes categories, navigates and releases scroll lock", async () => {
    const user = userEvent.setup();
    renderNavigation();
    const opener = screen.getByRole("button", { name: "Open menu" });
    await user.click(opener);
    expect(opener.getAttribute("aria-expanded")).toBe("true");
    const menu = screen.getByRole("dialog", { name: "Explore Ornate" });
    expect(menu.hasAttribute("open")).toBe(true);
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Close navigation" }),
    );
    const categories = screen.getByRole("button", {
      name: "Show jewellery categories",
    });
    await user.click(categories);
    expect(categories.getAttribute("aria-expanded")).toBe("true");
    await user.click(within(menu).getByRole("link", { name: "Earrings" }));
    expect(
      screen.getByRole("heading", { name: "Earrings collection" }),
    ).toBeTruthy();
    await waitFor(() => expect(menu.hasAttribute("open")).toBe(false));
    expect(document.body.style.overflow).not.toBe("hidden");
  });
  it("supports Escape cancellation and closing without leaving an invisible modal over the page", async () => {
    const user = userEvent.setup();
    renderNavigation();
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const menu = screen.getByRole("dialog", { name: "Explore Ornate" });
    fireEvent(menu, new Event("cancel", { bubbles: false, cancelable: true }));
    await waitFor(() => expect(menu.hasAttribute("open")).toBe(false));
    expect(
      screen
        .getByRole("button", { name: "Open menu" })
        .getAttribute("aria-expanded"),
    ).toBe("false");
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(screen.getByRole("button", { name: "Close navigation" }));
    await waitFor(() => expect(menu.hasAttribute("open")).toBe(false));
  });
  it("submits search and closes the search dialog on navigation", async () => {
    const user = userEvent.setup();
    renderNavigation();
    await user.click(screen.getByRole("button", { name: "Search jewellery" }));
    await user.type(
      screen.getByRole("textbox", { name: "Search for jewellery" }),
      "emerald",
    );
    await user.click(screen.getByRole("button", { name: "Submit search" }));
    expect(
      screen.getByRole("heading", { name: "Search results" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("dialog", { name: "What catches your eye?" }),
    ).toBe(null);
  });
});
