import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
Object.defineProperty(window, "scrollTo", { value: vi.fn(), writable: true });
Object.defineProperty(window, "matchMedia", {
  value: vi.fn().mockImplementation((query) => ({
    matches: query.includes("reduced-motion"),
    media: query,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
HTMLDialogElement.prototype.showModal = function () {
  this.setAttribute("open", "");
};
HTMLDialogElement.prototype.close = function () {
  this.removeAttribute("open");
};
afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});

// jsdom has no viewport. These observers support component mounting; they do not certify visual layout.
class TestIntersectionObserver {
  root = null;
  rootMargin = "";
  thresholds = [0];
  constructor(_callback: IntersectionObserverCallback) {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
Object.defineProperty(window, "IntersectionObserver", {
  value: TestIntersectionObserver,
  writable: true,
});
Object.defineProperty(globalThis, "IntersectionObserver", {
  value: TestIntersectionObserver,
  writable: true,
});
Object.defineProperty(document, "fonts", {
  value: { ready: Promise.resolve() },
  configurable: true,
});

// jsdom has no layout; components still need observer lifecycle cleanup.
class TestResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(globalThis, "ResizeObserver", {
  value: TestResizeObserver,
  configurable: true,
  writable: true,
});
