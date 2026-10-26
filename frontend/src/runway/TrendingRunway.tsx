import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Pause,
  Play,
  Heart,
  ImageOff,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { money, type Product } from "../data";
import { useStore } from "../store";
import {
  TRENDING_PRODUCTS,
  RUNWAY_TIMING,
  mod,
  runwayPose,
  uniqueProducts,
  visualAdjustments,
  type RunwayLayout,
} from "./model";
import "./runway.css";
gsap.registerPlugin(useGSAP);
function ProductImage({
  product,
  visible,
}: {
  product: Product;
  visible: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <span className="runway-image-fallback">
      <ImageOff size={26} />
      <span>{product.name}</span>
    </span>
  ) : (
    <img
      src={product.image}
      alt={visible ? product.name : ""}
      width={700}
      height={700}
      loading="eager"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
export default function TrendingRunway({
  items = TRENDING_PRODUCTS,
}: {
  items?: Product[];
}) {
  const unique = uniqueProducts(items);
  const signature = unique.map((p) => p.id).join("|");
  return unique.length ? (
    <Runway key={signature} items={unique} />
  ) : (
    <div className="runway-empty">
      <p>A new edit is on its way.</p>
      <Link className="text-link" to="/shop">
        Explore all jewellery
        <ArrowUpRight size={15} />
      </Link>
    </div>
  );
}
function Runway({ items }: { items: Product[] }) {
  const stage = useRef<HTMLDivElement>(null);
  const size = useRef({ width: 1, height: 1 });
  const root = useRef<HTMLDivElement>(null);
  const nodes = useRef(new Map<number, HTMLDivElement>());
  const info = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(0);
  const current = useRef(0);
  const [moving, setMoving] = useState(false);
  const locked = useRef(false);
  const [layout, setLayout] = useState<RunwayLayout>("desktop");
  const layoutRef = useRef<RunwayLayout>("desktop");
  const progress = useRef({ value: 0 });
  const direction = useRef<1 | -1>(1);
  const travelSteps = useRef(1);
  const suppressClick = useRef(0);
  const transitioning = useRef(false);
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [enabled, setEnabled] = useState(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [inView, setInView] = useState(false);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [hidden, setHidden] = useState(document.hidden);
  const [announcement, setAnnouncement] = useState("");
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const gesture = useRef<{
    id: number;
    x: number;
    y: number;
    lastX: number;
    lastY: number;
  } | null>(null);
  const count = items.length;
  const { wishlist, toggleWish } = useStore();
  const render = () => {
    nodes.current.forEach((node, index) => {
      const travel = transitioning.current ? progress.current.value : 0;
      const segment = Math.min(Math.floor(travel), travelSteps.current - 1);
      const pose = runwayPose(
        index,
        mod(current.current + direction.current * segment, count),
        count,
        direction.current,
        travel - segment,
        layoutRef.current,
      );
      const adjustment = visualAdjustments[items[index].id] || {
        scale: 1,
        y: 0,
      };
      gsap.set(node, {
        xPercent: -50,
        yPercent: -50,
        x: (pose.x - 0.5) * size.current.width,
        y: (pose.y + adjustment.y - 0.5) * size.current.height,
        scale: pose.scale * adjustment.scale,
        opacity: pose.opacity,
        zIndex: pose.layer,
      });
    });
  };
  const { contextSafe } = useGSAP(
    () => {
      const resize = new ResizeObserver(() => {
        const width = root.current?.clientWidth || 1000;
        size.current = {
          width: stage.current?.clientWidth || 1,
          height: stage.current?.clientHeight || 1,
        };
        const next: RunwayLayout =
          width < 560 ? "mobile" : width < 920 ? "tablet" : "desktop";
        layoutRef.current = next;
        setLayout(next);
        render();
      });
      if (root.current) resize.observe(root.current);
      if (stage.current) resize.observe(stage.current);
      size.current = {
        width: stage.current?.clientWidth || 1,
        height: stage.current?.clientHeight || 1,
      };
      render();
      return () => {
        resize.disconnect();
        timeline.current?.kill();
      };
    },
    { scope: root },
  );
  useGSAP(
    () => {
      render();
    },
    { scope: root, dependencies: [selected, layout] },
  );
  const move = contextSafe((dir: 1 | -1, manual = true, steps = 1) => {
    if (locked.current || count < 2) return;
    const destination = mod(current.current + dir * steps, count);
    if (destination === current.current) return;
    travelSteps.current = steps;
    const finish = () => {
      current.current = destination;
      transitioning.current = false;
      progress.current.value = 0;
      locked.current = false;
      setSelected(destination);
      setMoving(false);
      render();
      setAnnouncement(
        manual
          ? `${items[destination].name}, ${destination + 1} of ${count}.`
          : "",
      );
      gsap.set(info.current, { opacity: 1, y: 0 });
    };
    if (reduced) {
      finish();
      return;
    }
    locked.current = true;
    setMoving(true);
    direction.current = dir;
    transitioning.current = true;
    progress.current.value = 0;
    render();
    timeline.current = gsap.timeline({ onComplete: finish });
    timeline.current
      .to(
        progress.current,
        {
          value: steps,
          duration: RUNWAY_TIMING.travel + Math.min(0.45, (steps - 1) * 0.18),
          ease: "power2.inOut",
          onUpdate: render,
        },
        0,
      )
      .to(
        info.current,
        { opacity: 0.25, y: 8, duration: 0.25, ease: "power1.inOut" },
        0.1,
      );
  });
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReduced(query.matches);
      if (query.matches) {
        setEnabled(false);
        if (locked.current) {
          timeline.current?.progress(1);
        }
      }
    };
    query.addEventListener("change", update);
    const visibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver(
      (entries) => setInView(entries[0].isIntersecting),
      { threshold: 0.25 },
    );
    if (root.current) observer.observe(root.current);
    return () => {
      query.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", visibility);
      observer.disconnect();
    };
  }, []);
  const canAuto =
    enabled &&
    !reduced &&
    count > 1 &&
    inView &&
    !hidden &&
    !hover &&
    !focus &&
    !dragging &&
    !moving;
  const moveRef = useRef(move);
  moveRef.current = move;
  useEffect(() => {
    if (!canAuto) return;
    const timer = window.setTimeout(
      () => moveRef.current(1, false),
      RUNWAY_TIMING.dwell,
    );
    return () => window.clearTimeout(timer);
  }, [canAuto, selected]);
  const selectProduct = (index: number) => {
    if (
      suppressClick.current > Date.now() ||
      locked.current ||
      index === current.current
    )
      return;
    move(1, true, mod(index - current.current, count));
  };
  const mounted = items.map((p, index) => ({ p, index }));
  const product = items[selected];
  const pointerDown = (e: PointerEvent<HTMLDivElement>) => {
    suppressClick.current = 0;
    if (e.pointerType === "mouse" || count < 2) return;
    gesture.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
    };
    setDragging(true);
  };
  const pointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!gesture.current || gesture.current.id !== e.pointerId) return;
    gesture.current.lastX = e.clientX;
    gesture.current.lastY = e.clientY;
  };
  const pointerEnd = (e: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    gesture.current = null;
    setDragging(false);
    if (!g || g.id !== e.pointerId) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      suppressClick.current = Date.now() + 500;
      move(dx < 0 ? 1 : -1);
    }
  };
  return (
    <div
      ref={root}
      data-product-source={product.id}
      className={`trending-runway runway-${layout}`}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setHover(true);
      }}
      onPointerLeave={() => setHover(false)}
      onFocusCapture={() => setFocus(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null))
          setFocus(false);
      }}
    >
      <div className="runway-display">
        <div
          ref={stage}
          className="runway-stage"
          role="group"
          aria-label="Trending jewellery display"
          onPointerDown={pointerDown}
          onPointerMove={pointerMove}
          onPointerUp={pointerEnd}
          onPointerCancel={() => {
            gesture.current = null;
            setDragging(false);
          }}
          onLostPointerCapture={() => {
            gesture.current = null;
            setDragging(false);
          }}
        >
          <div className="runway-atmosphere" aria-hidden="true" />

          {mounted.map(({ p, index }) => {
            const visible =
              runwayPose(index, selected, count, 1, 0, layout).opacity > 0;
            return (
              <div
                key={p.id}
                ref={(node) => {
                  if (node) nodes.current.set(index, node);
                  else nodes.current.delete(index);
                }}
                className={`runway-piece ${index === selected ? "is-selected" : ""} ${visualAdjustments[p.id]?.grounded ? "is-grounded" : ""}`}
                aria-hidden={!visible}
                style={{ left: "50%", top: "50%", opacity: 0 }}
              >
                <button
                  type="button"
                  className="runway-piece-select"
                  aria-label={`Select ${p.name}`}
                  aria-pressed={index === selected}
                  tabIndex={visible ? 0 : -1}
                  disabled={moving || !visible}
                  onClick={() => selectProduct(index)}
                >
                  <span
                    className="runway-photo"
                    data-product-part={index === selected ? "image" : undefined}
                  >
                    <ProductImage product={p} visible={index === selected} />
                  </span>
                </button>
              </div>
            );
          })}
        </div>
        <div className="runway-controls">
          <div>
            <button
              type="button"
              aria-label="Previous trending product"
              disabled={moving || count < 2}
              onClick={() => move(-1)}
            >
              <ArrowLeft size={18} />
            </button>
            <span aria-label={`Product ${selected + 1} of ${count}`}>
              {String(selected + 1).padStart(2, "0")}
              <i /> {String(count).padStart(2, "0")}
            </span>
            <button
              type="button"
              aria-label="Next trending product"
              disabled={moving || count < 2}
              onClick={() => move(1)}
            >
              <ArrowRight size={18} />
            </button>
          </div>
          <button
            className="runway-autoplay"
            type="button"
            disabled={count < 2 || reduced}
            aria-label={
              enabled ? "Pause trending autoplay" : "Play trending autoplay"
            }
            aria-pressed={!enabled}
            onClick={() => setEnabled((v) => !v)}
          >
            {enabled && !reduced ? <Pause size={14} /> : <Play size={14} />}
            <span>
              {reduced
                ? "Motion reduced"
                : enabled
                  ? "Pause autoplay"
                  : "Play autoplay"}
            </span>
          </button>
        </div>
      </div>
      <div className="runway-product-panel" aria-busy={moving}>
        <div ref={info} className="runway-product-info">
          <div className="runway-product-identity">
            <span className="runway-product-category">
              {product.category} · {product.material}
            </span>
            <h3 data-product-part="name">{product.name}</h3>
          </div>
          <p className="runway-product-price" data-product-part="price">
            {product.purchasable
              ? money(product.price)
              : "Price on consultation"}
            {product.purchasable && product.stock <= 0 && (
              <span className="runway-availability">Currently unavailable</span>
            )}
          </p>
          <div className="runway-product-actions">
            {moving ? (
              <span className="button runway-busy-link">
                Presenting the next piece…
              </span>
            ) : (
              <Link className="button" to={`/products/${product.slug}`}>
                {!product.purchasable
                  ? "Discover this piece"
                  : product.stock > 0
                    ? "Choose your piece"
                    : "View this piece"}
                <ArrowUpRight size={16} />
              </Link>
            )}
            <button
              type="button"
              className="runway-save"
              disabled={moving}
              onClick={() => toggleWish(product.id)}
              aria-label={`${wishlist.includes(product.id) ? "Remove" : "Save"} ${product.name} ${wishlist.includes(product.id) ? "from" : "to"} wishlist`}
              aria-pressed={wishlist.includes(product.id)}
            >
              <Heart
                size={17}
                fill={wishlist.includes(product.id) ? "currentColor" : "none"}
              />
            </button>
          </div>
        </div>
      </div>
      <span className="runway-live" aria-live="polite" aria-atomic="true">
        {announcement}
      </span>
    </div>
  );
}
