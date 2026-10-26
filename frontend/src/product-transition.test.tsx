import { afterEach, describe, expect, it, vi } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProductTransitions } from "./ProductTransition";
import { PageTransition } from "./PageTransition";
import ProductPage from "./Product";
import { ProductCard } from "./components";
import { StoreProvider } from "./store";
import { products } from "./data";

const originalAPI = document.startViewTransition;
const media = vi.mocked(window.matchMedia).getMockImplementation()!;
afterEach(() => {
  vi.restoreAllMocks();
  document.startViewTransition = originalAPI;
  vi.mocked(window.matchMedia).mockImplementation(media);
});
function setup(reduced = false) {
  vi.mocked(window.matchMedia).mockImplementation((query) => ({
    ...media(query),
    matches: reduced,
  }));
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    x: 20,
    y: 100,
    left: 20,
    top: 100,
    right: 220,
    bottom: 350,
    width: 200,
    height: 250,
    toJSON: () => ({}),
  });
  return render(
    <MemoryRouter initialEntries={["/shop"]}>
      <StoreProvider>
        <ProductTransitions>
          <PageTransition>
            <Routes>
              <Route
                path="/shop"
                element={
                  <>
                    <ProductCard product={products[0]} />
                    <ProductCard product={products[0]} />
                  </>
                }
              />
              <Route path="/products/:slug" element={<ProductPage />} />
            </Routes>
          </PageTransition>
        </ProductTransitions>
      </StoreProvider>
    </MemoryRouter>,
  );
}
function nativeTransition() {
  let finish = () => {};
  const finished = new Promise<void>((resolve) => {
    finish = resolve;
  });
  let ready = false;
  const skipTransition = vi.fn(finish);
  const start = vi.fn((update: () => Promise<void>) => {
    const updateCallbackDone = Promise.resolve().then(update);
    return {
      updateCallbackDone,
      ready: updateCallbackDone.then(() => {
        ready = true;
      }),
      finished,
      skipTransition,
    } as unknown as ViewTransition;
  });
  document.startViewTransition =
    start as unknown as typeof document.startViewTransition;
  return { start, finish, skipTransition, ready: () => ready };
}

describe("product shared-element navigation", () => {
  it("names only the clicked card, waits for the detail page, and releases names after arrival", async () => {
    const native = nativeTransition();
    const view = setup();
    const links = screen.getAllByRole("link", {
      name: "Discover The Emerald Muse",
    });
    fireEvent.click(links[1]);
    expect(native.start).toHaveBeenCalledTimes(1);
    expect(links[0].style.viewTransitionName).toBe("");
    expect(links[1].style.viewTransitionName).toBe("ornate-product-image");
    // Rapid repeat input does not start a competing navigation/snapshot.
    fireEvent.click(links[1]);
    expect(native.start).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(native.ready()).toBe(true));
    expect(
      screen.getByRole("heading", { level: 1, name: products[0].name }).style
        .viewTransitionName,
    ).toBe("ornate-product-name");
    expect(
      view.container.querySelector<HTMLElement>(".main-product-image")!.style
        .viewTransitionName,
    ).toBe("ornate-product-image");
    expect(
      view.container.querySelector(".product-shared-arrival"),
    ).toBeTruthy();
    await act(async () => native.finish());
    expect(
      document.documentElement.hasAttribute("data-product-transition"),
    ).toBe(false);
    expect(
      view.container.querySelector<HTMLElement>(".main-product-image")!.style
        .viewTransitionName,
    ).toBe("");
    expect(
      screen.getByRole("button", { name: /Add to your bag/ }),
    ).toBeTruthy();
  });
  it("uses ordinary navigation for reduced motion or an unsupported browser", async () => {
    const native = nativeTransition();
    const view = setup(true);
    fireEvent.click(
      screen.getAllByRole("link", { name: "Discover The Emerald Muse" })[0],
    );
    expect(native.start).not.toHaveBeenCalled();
    expect(
      await screen.findByRole("heading", { level: 1, name: products[0].name }),
    ).toBeTruthy();
    view.unmount();
    document.startViewTransition =
      undefined as unknown as typeof document.startViewTransition;
    setup();
    fireEvent.click(
      screen.getAllByRole("link", { name: "Discover The Emerald Muse" })[0],
    );
    expect(
      await screen.findByRole("heading", { level: 1, name: products[0].name }),
    ).toBeTruthy();
  });
  it("cancels safely on resize without leaving names or a blocked transition", async () => {
    const native = nativeTransition();
    const view = setup();
    fireEvent.click(
      screen.getAllByRole("link", { name: "Discover The Emerald Muse" })[0],
    );
    await waitFor(() => expect(native.ready()).toBe(true));
    fireEvent(window, new Event("resize"));
    expect(native.skipTransition).toHaveBeenCalledTimes(1);
    expect(
      document.documentElement.hasAttribute("data-product-transition"),
    ).toBe(false);
    view.unmount();
    await act(async () => native.finish());
  });
  it("recovers to the product page if the browser cannot start the transition", async () => {
    nativeTransition();
    document.startViewTransition = vi.fn(() => {
      throw new Error("unavailable snapshot");
    });
    setup();
    fireEvent.click(
      screen.getAllByRole("link", { name: "Discover The Emerald Muse" })[0],
    );
    expect(
      await screen.findByRole("heading", { level: 1, name: products[0].name }),
    ).toBeTruthy();
    expect(
      document.documentElement.hasAttribute("data-product-transition"),
    ).toBe(false);
  });
});
