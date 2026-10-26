import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { products } from "./data";
import { scrollToPosition } from "./experience";
import "./product-transition.css";

type Part = "image" | "name" | "price" | "description";
const parts: Part[] = ["image", "name", "price", "description"];
type Journey = {
  id: string;
  path: string;
  sources: { node: HTMLElement; previous: string }[];
  targets: { node: HTMLElement; previous: string }[];
  resolve: () => void;
  timer: number;
  transition?: ViewTransition;
  arrived: boolean;
  cleaned: boolean;
};
const Arrival = createContext<(id: string, node: HTMLElement) => void>(
  () => {},
);
const name = (part: Part) => `ornate-product-${part}`;
const visible = (node: HTMLElement) => {
  const r = node.getBoundingClientRect();
  return (
    r.width > 0 &&
    r.height > 0 &&
    r.bottom > 0 &&
    r.top < window.innerHeight &&
    r.right > 0 &&
    r.left < window.innerWidth
  );
};
function tag(node: HTMLElement, part: Part) {
  const previous = node.style.viewTransitionName;
  node.style.viewTransitionName = name(part);
  return { node, previous };
}

export function ProductTransitions({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  const journey = useRef<Journey | null>(null);
  const reset = (j: Journey) => {
    if (j.cleaned) return;
    j.cleaned = true;
    window.clearTimeout(j.timer);
    [...j.sources, ...j.targets].forEach(({ node, previous }) => {
      node.style.viewTransitionName = previous;
    });
    j.resolve();
    if (journey.current === j) {
      journey.current = null;
      delete document.documentElement.dataset.productTransition;
    }
  };
  const arrive = (id: string, root: HTMLElement) => {
    const j = journey.current;
    if (!j || j.id !== id || j.arrived) return;
    j.arrived = true;
    // The old snapshot is already captured. Only destination nodes may now own these names.
    j.sources.forEach(({ node, previous }) => {
      node.style.viewTransitionName = previous;
    });
    scrollToPosition(0);
    parts.forEach((part) => {
      const target = root.querySelector<HTMLElement>(
        `[data-product-target="${part}"]`,
      );
      if (target) j.targets.push(tag(target, part));
    });
    const image = root.querySelector<HTMLImageElement>(
      '[data-product-target="image"] img',
    );
    // Decoding is bounded by the journey timeout, including failed/slow image requests.
    const decoded = image?.decode
      ? image.decode().catch(() => {})
      : Promise.resolve();
    void decoded.then(() => {
      if (journey.current === j) j.resolve();
    });
  };
  useEffect(() => {
    const click = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !document.startViewTransition ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
        return;
      const anchor = (event.target as Element)?.closest<HTMLAnchorElement>(
        "a[href]",
      );
      if (
        !anchor ||
        anchor.hasAttribute("download") ||
        (anchor.target && anchor.target !== "_self")
      )
        return;
      const url = new URL(anchor.href);
      if (
        url.origin !== window.location.origin ||
        url.pathname === window.location.pathname
      )
        return;
      const product = products.find(
        (p) => url.pathname === `/products/${p.slug}`,
      );
      const source = anchor.closest<HTMLElement>("[data-product-source]");
      if (!product || !source || source.dataset.productSource !== product.id)
        return;
      const image = source.querySelector<HTMLElement>(
        '[data-product-part="image"]',
      );
      if (!image || !visible(image)) return;
      if (journey.current) {
        event.preventDefault();
        return;
      }
      event.preventDefault(); // React Router leaves this navigation to the snapshot callback.
      let resolve = () => {};
      const ready = new Promise<void>((done) => {
        resolve = done;
      });
      const j: Journey = {
        id: product.id,
        path: url.pathname,
        sources: [],
        targets: [],
        resolve,
        timer: 0,
        arrived: false,
        cleaned: false,
      };
      journey.current = j;
      parts.forEach((part) => {
        const node = source.querySelector<HTMLElement>(
          `[data-product-part="${part}"]`,
        );
        if (node && visible(node)) j.sources.push(tag(node, part));
      });
      document.documentElement.dataset.productTransition = "active";
      j.timer = window.setTimeout(() => {
        j.transition?.skipTransition();
        reset(j);
      }, 2200);
      try {
        j.transition = document.startViewTransition(() => {
          navigateRef.current(url.pathname + url.search + url.hash);
          return ready;
        });
        void j.transition.ready.catch(() => {});
        void j.transition.updateCallbackDone.catch(() => {});
        void j.transition.finished.catch(() => {}).finally(() => reset(j));
      } catch {
        reset(j);
        navigateRef.current(url.pathname + url.search + url.hash);
      }
    };
    document.addEventListener("click", click, true);
    const cancel = () => {
      const j = journey.current;
      if (j) {
        j.transition?.skipTransition();
        reset(j);
      }
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const preference = () => {
      if (reduce.matches) cancel();
    };
    const visibility = () => {
      if (document.hidden) cancel();
    };
    window.addEventListener("resize", cancel);
    document.addEventListener("visibilitychange", visibility);
    reduce.addEventListener("change", preference);
    return () => {
      document.removeEventListener("click", click, true);
      window.removeEventListener("resize", cancel);
      document.removeEventListener("visibilitychange", visibility);
      reduce.removeEventListener("change", preference);
      cancel();
    };
  }, []);
  useEffect(() => {
    const j = journey.current;
    if (j && location.pathname !== j.path) {
      j.transition?.skipTransition();
      reset(j);
    }
  }, [location.pathname]);
  return <Arrival.Provider value={arrive}>{children}</Arrival.Provider>;
}
export function useProductArrival(id: string) {
  const arrive = useContext(Arrival);
  const root = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    if (root.current) arrive(id, root.current);
  }, [id, arrive]);
  return root;
}
