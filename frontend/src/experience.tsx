import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ReactNode } from "react";
import "lenis/dist/lenis.css";

let scrollHandler: ((top: number) => void) | undefined;
export function scrollToPosition(top: number) {
  if (scrollHandler) scrollHandler(top);
  else window.scrollTo({ top, behavior: "instant" });
}
export function SmoothExperience() {
  const { pathname } = useLocation();
  useEffect(() => {
    const media = window.matchMedia(
      "(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    let cleanup = () => {};
    let cancelled = false;
    const setup = async () => {
      cleanup();
      if (!media.matches) return;
      const { default: Lenis } = await import("lenis");
      if (cancelled || !media.matches) return;
      const lenis = new Lenis({
        autoRaf: true,
        duration: 1.12,
        smoothWheel: true,
        syncTouch: false,
        prevent: (node) =>
          !!node.closest("dialog") || !!document.querySelector("dialog[open]"),
      });
      lenis.on("scroll", ScrollTrigger.update);
      scrollHandler = (top) =>
        lenis.scrollTo(top, { immediate: true, force: true });
      const reset = () => lenis.scrollTo(0, { immediate: true, force: true });
      window.addEventListener("ornate:navigate", reset);
      cleanup = () => {
        window.removeEventListener("ornate:navigate", reset);
        scrollHandler = undefined;
        lenis.destroy();
      };
    };
    void setup();
    media.addEventListener("change", setup);
    return () => {
      cancelled = true;
      media.removeEventListener("change", setup);
      cleanup();
    };
  }, []);
  useEffect(() => {
    window.dispatchEvent(new Event("ornate:navigate"));
  }, [pathname]);
  return null;
}
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        gsap.set(ref.current, { scaleX: max > 0 ? window.scrollY / max : 0 });
      });
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
    };
  }, []);
  return <div className="reading-progress" ref={ref} aria-hidden="true" />;
}
