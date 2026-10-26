import gsap from "gsap";
import { describe, it, expect, vi } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { StoreProvider } from "../store";
import { products } from "../data";
import TrendingRunway from "./TrendingRunway";
import { mod, runwayPose, uniqueProducts, type RunwayLayout } from "./model";
function app(items = products.slice(0, 6)) {
  return render(
    <MemoryRouter>
      <StoreProvider>
        <TrendingRunway items={items} />
      </StoreProvider>
    </MemoryRouter>,
  );
}
describe("runway paths", () => {
  it("keeps every visible piece continuous across forward and reverse loops for 2–8 unique products", () => {
    for (const count of [2, 3, 4, 5, 6, 7, 8])
      for (const layout of ["desktop", "tablet", "mobile"] as RunwayLayout[])
        for (const dir of [1, -1] as const)
          for (let selected = 0; selected < count; selected++) {
            for (let index = 0; index < count; index++) {
              const end = runwayPose(index, selected, count, dir, 1, layout);
              const settled = runwayPose(
                index,
                mod(selected + dir, count),
                count,
                1,
                0,
                layout,
              );
              if (end.opacity > 0 || settled.opacity > 0) {
                expect(end.x).toBeCloseTo(settled.x);
                expect(end.y).toBeCloseTo(settled.y);
                expect(end.scale).toBeCloseTo(settled.scale);
                expect(end.opacity).toBeCloseTo(settled.opacity);
              }
            }
          }
  });
  it("only wraps a short-list item while it is invisible and outside the stage", () => {
    for (const count of [2, 3, 4])
      for (const layout of ["desktop", "tablet", "mobile"] as RunwayLayout[]) {
        const before = runwayPose(0, 0, count, 1, 0.5 - 1e-8, layout);
        const after = runwayPose(0, 0, count, 1, 0.5, layout);
        expect(before.opacity).toBeLessThan(0.00001);
        expect(before.x).toBeGreaterThan(1);
        expect(after.opacity).toBe(0);
        expect(after.x).toBeLessThan(0);
        const reverseBefore = runwayPose(
          count - 1,
          0,
          count,
          -1,
          0.5 - 1e-8,
          layout,
        );
        const reverseAfter = runwayPose(count - 1, 0, count, -1, 0.5, layout);
        expect(reverseBefore.opacity).toBeLessThan(0.00001);
        expect(reverseBefore.x).toBeLessThan(0);
        expect(reverseAfter.opacity).toBe(0);
        expect(reverseAfter.x).toBeGreaterThan(1);
      }
  });
  it("advances position and scale together and never duplicates catalogue entries", () => {
    const start = runwayPose(1, 0, 6, 1, 0, "desktop");
    const middle = runwayPose(1, 0, 6, 1, 0.5, "desktop");
    const end = runwayPose(1, 0, 6, 1, 1, "desktop");
    expect(middle.x).toBeGreaterThan(start.x);
    expect(middle.x).toBeLessThan(end.x);
    expect(middle.scale).toBeGreaterThan(start.scale);
    expect(middle.scale).toBeLessThan(end.scale);
    expect(
      uniqueProducts([products[0], products[0], products[1]]),
    ).toHaveLength(2);
  });
});
describe("runway controls and commerce synchronization", () => {
  it("brings any visible supporting piece forward and keeps its commerce actions aligned", async () => {
    const user = userEvent.setup();
    app();
    const third = screen.getByRole("button", {
      name: `Select ${products[2].name}`,
    });
    expect(third.getAttribute("aria-pressed")).toBe("false");
    await user.click(third);
    expect(
      screen.getByRole("heading", { name: products[2].name }),
    ).toBeTruthy();
    expect(third.getAttribute("aria-pressed")).toBe("true");
    expect(
      screen
        .getByRole("link", { name: "Choose your piece" })
        .getAttribute("href"),
    ).toBe(`/products/${products[2].slug}`);
    await user.click(
      screen.getByRole("button", { name: `Select ${products[5].name}` }),
    );
    expect(
      screen.getByRole("heading", { name: products[5].name }),
    ).toBeTruthy();
    await user.click(
      screen.getByRole("button", { name: `Select ${products[0].name}` }),
    );
    expect(
      screen.getByRole("heading", { name: products[0].name }),
    ).toBeTruthy();
  });
  it("supports keyboard selection on the ramp and exposes only visible pieces", async () => {
    const user = userEvent.setup();
    app();
    expect(
      screen.queryByRole("button", { name: `Select ${products[4].name}` }),
    ).toBeNull();
    await user.click(
      screen.getByRole("button", { name: `Select ${products[3].name}` }),
    );
    const choice = screen.getByRole("button", {
      name: `Select ${products[4].name}`,
    });
    choice.focus();
    await user.keyboard("{Enter}");
    expect(
      screen.getByRole("heading", { name: products[4].name }),
    ).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: "Discover this piece" })
        .getAttribute("href"),
    ).toBe(`/products/${products[4].slug}`);
    expect(choice.getAttribute("aria-pressed")).toBe("true");
  });

  it("starts paused for reduced motion and keeps product, price and link aligned through a full loop", async () => {
    const user = userEvent.setup();
    app(products.slice(0, 3));
    expect(
      (
        screen.getByRole("button", {
          name: "Play trending autoplay",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    for (let i = 0; i < 6; i++) {
      const product = products[i % 3];
      expect(screen.getByRole("heading", { name: product.name })).toBeTruthy();
      expect(
        screen
          .getByRole("link", { name: "Choose your piece" })
          .getAttribute("href"),
      ).toBe(`/products/${product.slug}`);
      expect(screen.getByRole("img").getAttribute("alt")).toBe(product.name);
      await user.click(
        screen.getByRole("button", { name: "Next trending product" }),
      );
    }
    await user.click(
      screen.getByRole("button", { name: "Previous trending product" }),
    );
    expect(
      screen.getByRole("heading", { name: products[2].name }),
    ).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: "Choose your piece" })
        .getAttribute("href"),
    ).toBe(`/products/${products[2].slug}`);
  });
  it("handles empty/single/duplicate lists and keeps unavailable or consultation actions truthful", () => {
    const view = app([]);
    expect(screen.getByText("A new edit is on its way.")).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "Next trending product" }),
    ).toBeNull();
    view.rerender(
      <MemoryRouter>
        <StoreProvider>
          <TrendingRunway items={[products[4], products[4]]} />
        </StoreProvider>
      </MemoryRouter>,
    );
    expect(
      (
        screen.getByRole("button", {
          name: "Next trending product",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(screen.getByText("Price on consultation")).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: "Discover this piece" })
        .getAttribute("href"),
    ).toBe("/products/royal-polki");
  });
  it("saves the featured product and provides an image-error fallback", async () => {
    const user = userEvent.setup();
    app();
    await user.click(
      screen.getByRole("button", { name: "Save The Emerald Muse to wishlist" }),
    );
    expect(JSON.parse(localStorage.getItem("ornate:wishlist")!)).toEqual([
      "emerald-muse",
    ]);
    const image = screen.getByRole("img");
    fireEvent.error(image);
    expect(screen.queryByRole("img")).toBeNull();
    expect(
      screen.getByRole("heading", { name: "The Emerald Muse" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Choose your piece" }),
    ).toBeTruthy();
  });
  it("supports horizontal touch swipes while leaving vertical scrolling alone", () => {
    app();
    const stage = screen.getByRole("group", {
      name: "Trending jewellery display",
    });
    const pointer = (type: string, x: number, y: number) => {
      const event = new Event(type, { bubbles: true });
      Object.defineProperties(event, {
        pointerId: { value: 1 },
        pointerType: { value: "touch" },
        clientX: { value: x },
        clientY: { value: y },
      });
      fireEvent(stage, event);
    };
    pointer("pointerdown", 250, 150);
    pointer("pointerup", 130, 158);
    expect(
      screen.getByRole("heading", { name: products[1].name }),
    ).toBeTruthy();
    pointer("pointerdown", 150, 150);
    pointer("pointerup", 165, 290);
    expect(
      screen.getByRole("heading", { name: products[1].name }),
    ).toBeTruthy();
    pointer("pointerdown", 100, 150);
    pointer("pointerup", 225, 154);
    expect(
      screen.getByRole("heading", { name: products[0].name }),
    ).toBeTruthy();
  });
  it("keeps the selected product while changing responsive depth presets", () => {
    const original = globalThis.ResizeObserver;
    let resize: ResizeObserverCallback = () => {};
    globalThis.ResizeObserver = class {
      constructor(callback: ResizeObserverCallback) {
        resize = callback;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    try {
      const view = app();
      fireEvent.click(
        screen.getByRole("button", { name: "Next trending product" }),
      );
      const root = view.container.querySelector(".trending-runway")!;
      const stage = view.container.querySelector(".runway-stage")!;
      Object.defineProperty(root, "clientWidth", {
        value: 390,
        configurable: true,
      });
      Object.defineProperty(stage, "clientWidth", {
        value: 390,
        configurable: true,
      });
      Object.defineProperty(stage, "clientHeight", {
        value: 320,
        configurable: true,
      });
      act(() => resize([], {} as ResizeObserver));
      expect(root.classList.contains("runway-mobile")).toBe(true);
      expect(
        screen.getByRole("heading", { name: products[1].name }),
      ).toBeTruthy();
      Object.defineProperty(root, "clientWidth", {
        value: 1100,
        configurable: true,
      });
      act(() => resize([], {} as ResizeObserver));
      expect(root.classList.contains("runway-desktop")).toBe(true);
      expect(
        screen
          .getByRole("link", { name: "Choose your piece" })
          .getAttribute("href"),
      ).toBe(`/products/${products[1].slug}`);
    } finally {
      globalThis.ResizeObserver = original;
    }
  });
  it("locks rapid navigation until the shared transition finishes", async () => {
    const mock = vi.mocked(window.matchMedia);
    const original = mock.getMockImplementation()!;
    mock.mockImplementation((query) => ({
      matches: false,
      onchange: null,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    try {
      app();
      const next = screen.getByRole("button", {
        name: "Next trending product",
      });
      fireEvent.click(next);
      fireEvent.click(next);
      expect((next as HTMLButtonElement).disabled).toBe(true);
      expect(
        screen.queryByRole("link", { name: "Choose your piece" }),
      ).toBeNull();
      await waitFor(
        () =>
          expect(
            screen.getByRole("heading", { name: "Gulabi Chand Earrings" }),
          ).toBeTruthy(),
        { timeout: 2000 },
      );
      expect(
        screen
          .getByRole("link", { name: "Choose your piece" })
          .getAttribute("href"),
      ).toBe("/products/gulabi-drops");
      expect((next as HTMLButtonElement).disabled).toBe(false);
      fireEvent.click(
        screen.getByRole("button", { name: `Select ${products[3].name}` }),
      );
      // A second target cannot interrupt an in-flight multi-piece selection.
      fireEvent.click(
        screen.getByRole("button", { name: `Select ${products[2].name}` }),
      );
      expect((next as HTMLButtonElement).disabled).toBe(true);
      act(() => {
        gsap.globalTimeline
          .getChildren(false, false, true)
          .forEach((t) => t.progress(1));
      });
      expect(
        screen.getByRole("heading", { name: products[3].name }),
      ).toBeTruthy();
      expect(
        screen
          .getByRole("link", { name: "Choose your piece" })
          .getAttribute("href"),
      ).toBe(`/products/${products[3].slug}`);
    } finally {
      mock.mockImplementation(original);
    }
  });
});

describe("autoplay pause lifecycle", () => {
  it("respects viewport, focus, hover, visibility and explicit pause with a full new dwell", async () => {
    const media = vi.mocked(window.matchMedia);
    const originalMedia = media.getMockImplementation()!;
    const originalObserver = globalThis.IntersectionObserver;
    const hiddenDescriptor = Object.getOwnPropertyDescriptor(
      document,
      "hidden",
    );
    let notifyIntersection: IntersectionObserverCallback = () => {};
    media.mockImplementation((query) => ({
      matches: false,
      onchange: null,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    globalThis.IntersectionObserver = class {
      constructor(callback: IntersectionObserverCallback) {
        notifyIntersection = callback;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
      root = null;
      rootMargin = "";
      thresholds = [];
    };
    Object.defineProperty(document, "hidden", {
      value: false,
      configurable: true,
    });
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const visible = (value: boolean) =>
      act(() =>
        notifyIntersection(
          [{ isIntersecting: value } as IntersectionObserverEntry],
          {} as IntersectionObserver,
        ),
      );
    const tick = (ms: number) =>
      act(() => {
        vi.advanceTimersByTime(ms);
      });
    const finish = () =>
      act(() => {
        gsap.globalTimeline
          .getChildren(false, false, true)
          .forEach((t) => t.progress(1));
      });
    const name = () => screen.getByRole("heading", { level: 3 }).textContent;
    let view: ReturnType<typeof app> | undefined;
    try {
      view = app();
      const root = view.container.querySelector(".trending-runway")!;
      tick(10000);
      expect(name()).toBe(products[0].name);
      visible(true);
      tick(4999);
      expect(name()).toBe(products[0].name);
      tick(1);
      expect(
        (
          screen.getByRole("button", {
            name: "Next trending product",
          }) as HTMLButtonElement
        ).disabled,
      ).toBe(true);
      finish();
      expect(name()).toBe(products[1].name);
      const next = screen.getByRole("button", {
        name: "Next trending product",
      });
      fireEvent.focusIn(next);
      tick(7000);
      expect(name()).toBe(products[1].name);
      fireEvent.focusOut(next, { relatedTarget: document.body });
      const enter = new MouseEvent("pointerover", { bubbles: true });
      Object.defineProperty(enter, "pointerType", { value: "mouse" });
      fireEvent(root, enter);
      tick(7000);
      expect(name()).toBe(products[1].name);
      const leave = new MouseEvent("pointerout", {
        bubbles: true,
        relatedTarget: document.body,
      });
      Object.defineProperty(leave, "pointerType", { value: "mouse" });
      fireEvent(root, leave);
      Object.defineProperty(document, "hidden", {
        value: true,
        configurable: true,
      });
      fireEvent(document, new Event("visibilitychange"));
      tick(7000);
      expect(name()).toBe(products[1].name);
      Object.defineProperty(document, "hidden", {
        value: false,
        configurable: true,
      });
      fireEvent(document, new Event("visibilitychange"));
      fireEvent.click(
        screen.getByRole("button", { name: "Pause trending autoplay" }),
      );
      visible(false);
      visible(true);
      tick(9000);
      expect(name()).toBe(products[1].name);
      expect(
        screen.getByRole("button", { name: "Play trending autoplay" }),
      ).toBeTruthy();
      fireEvent.click(
        screen.getByRole("button", { name: "Next trending product" }),
      );
      finish();
      expect(name()).toBe(products[2].name);
      tick(9000);
      expect(name()).toBe(products[2].name);
      fireEvent.click(
        screen.getByRole("button", { name: "Play trending autoplay" }),
      );
      tick(4999);
      expect(name()).toBe(products[2].name);
      tick(1);
      finish();
      expect(name()).toBe(products[3].name);
      visible(false);
      tick(9000);
      expect(name()).toBe(products[3].name);
    } finally {
      view?.unmount();
      vi.useRealTimers();
      media.mockImplementation(originalMedia);
      globalThis.IntersectionObserver = originalObserver;
      if (hiddenDescriptor)
        Object.defineProperty(document, "hidden", hiddenDescriptor);
      else delete (document as unknown as Record<string, unknown>).hidden;
    }
  });
});
