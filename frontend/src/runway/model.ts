import { products, type Product } from "../data";
export const TRENDING_PRODUCTS = products.slice(0, 6);
export const RUNWAY_TIMING = { travel: 0.9, dwell: 5000 };
export type Pose = {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  layer: number;
};
export type RunwayLayout = "desktop" | "tablet" | "mobile";
export const mod = (value: number, length: number) =>
  ((value % length) + length) % length;
// Normalized centres and depth scales for the responsive 3:4 photographic frames.
export const RUNWAY_POSITIONS: Record<RunwayLayout, Pose[]> = {
  desktop: [
    { x: -0.22, y: 0.37, scale: 0.32, opacity: 0, layer: 1 },
    { x: 0.1, y: 0.39, scale: 0.42, opacity: 1, layer: 2 },
    { x: 0.3, y: 0.43, scale: 0.59, opacity: 1, layer: 3 },
    { x: 0.52, y: 0.49, scale: 0.79, opacity: 1, layer: 4 },
    { x: 0.79, y: 0.56, scale: 1, opacity: 1, layer: 5 },
    { x: 1.25, y: 0.59, scale: 1.02, opacity: 0, layer: 6 },
  ],
  tablet: [
    { x: -0.25, y: 0.36, scale: 0.3, opacity: 0, layer: 1 },
    { x: -0.15, y: 0.37, scale: 0.35, opacity: 0, layer: 2 },
    { x: 0.12, y: 0.4, scale: 0.47, opacity: 1, layer: 3 },
    { x: 0.4, y: 0.47, scale: 0.7, opacity: 1, layer: 4 },
    { x: 0.77, y: 0.54, scale: 1, opacity: 1, layer: 5 },
    { x: 1.35, y: 0.57, scale: 1, opacity: 0, layer: 6 },
  ],
  mobile: [
    { x: -0.42, y: 0.37, scale: 0.25, opacity: 0, layer: 1 },
    { x: -0.3, y: 0.38, scale: 0.3, opacity: 0, layer: 2 },
    { x: -0.18, y: 0.41, scale: 0.35, opacity: 0, layer: 3 },
    { x: 0.2, y: 0.43, scale: 0.56, opacity: 1, layer: 4 },
    { x: 0.66, y: 0.55, scale: 1, opacity: 1, layer: 5 },
    { x: 1.48, y: 0.57, scale: 1, opacity: 0, layer: 6 },
  ],
};
export const visualAdjustments: Record<
  string,
  { scale: number; y: number; grounded?: boolean }
> = {
  "sunehri-kada": { scale: 0.96, y: 0.01, grounded: true },
  "emerald-embrace": { scale: 0.94, y: 0.01, grounded: true },
  "gulabi-drops": { scale: 1.04, y: -0.015 },
};
function at(slot: number, layout: RunwayLayout): Pose {
  return RUNWAY_POSITIONS[layout][Math.max(0, Math.min(5, slot + 1))];
}
function mix(a: Pose, b: Pose, t: number): Pose {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    scale: a.scale + (b.scale - a.scale) * t,
    opacity: a.opacity + (b.opacity - a.opacity) * t,
    layer: a.layer,
  };
}
/** Logical slots: -1 off-left, 0..3 visible, 4 off-right.
 * A short list recycles its outgoing piece only after it is fully offstage. */
export function runwayPose(
  index: number,
  selected: number,
  count: number,
  direction: 1 | -1,
  progress: number,
  layout: RunwayLayout,
): Pose {
  if (count <= 1) return at(3, layout);
  const offset = mod(index - selected, count);
  const slot = 3 - offset;
  if (direction === 1) {
    if (count <= 4 && offset === 0) {
      return progress < 0.5
        ? mix(at(3, layout), at(4, layout), progress * 2)
        : mix(at(-1, layout), at(4 - count, layout), (progress - 0.5) * 2);
    }
    if (offset <= 4)
      return mix(at(slot, layout), at(slot + 1, layout), progress);
  } else {
    if (count <= 4 && offset === count - 1) {
      return progress < 0.5
        ? mix(at(slot, layout), at(-1, layout), progress * 2)
        : mix(at(4, layout), at(3, layout), (progress - 0.5) * 2);
    }
    if (offset === count - 1)
      return mix(at(4, layout), at(3, layout), progress);
    if (offset <= 3)
      return mix(at(slot, layout), at(slot - 1, layout), progress);
  }
  return { ...at(-1, layout), opacity: 0 };
}
export function uniqueProducts(items: Product[]) {
  return items
    .filter((p, i) => items.findIndex((x) => x.id === p.id) === i)
    .slice(0, 8);
}
