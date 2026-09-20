"use client";
import { useEffect, useRef, useState } from "react";
import { MOTION, EASE_OUT_EXPO, prefersReducedMotion } from "@/lib/motion";

/**
 * CountUp — a metric that arrives at its real value.
 *
 * The number is the data, so this animates only when the element is on screen
 * and never invents a value: reduced motion, no IntersectionObserver, or a
 * non-numeric input all render the final number instantly.
 */
export function CountUp({
  value,
  duration = MOTION.slow + 220,
  className,
  format,
  suffix = "",
  prefix = "",
  /** Skip the count and show the value immediately (e.g. filters changing). */
  immediate = false,
}: {
  value: number;
  duration?: number;
  className?: string;
  format?: (n: number) => string;
  suffix?: string;
  prefix?: string;
  immediate?: boolean;
}) {
  const target = Number.isFinite(value) ? value : 0;
  const [shown, setShown] = useState(() => (immediate ? target : 0));
  const ref = useRef<HTMLSpanElement | null>(null);
  const doneFor = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (immediate || prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      setShown(target);
      return;
    }
    if (doneFor.current === target) return;

    let raf = 0;
    let start = 0;
    const run = (ts: number) => {
      if (!start) start = ts;
      const t = Math.min(1, (ts - start) / duration);
      // easeOutExpo, matching EASE_OUT_EXPO in CSS.
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setShown(target * eased);
      if (t < 1) raf = requestAnimationFrame(run);
      else {
        setShown(target);
        doneFor.current = target;
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          raf = requestAnimationFrame(run);
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, duration, immediate]);

  const text = format ? format(shown) : Math.round(shown).toLocaleString("en-IN");

  return (
    <span ref={ref} className={className} style={{ transitionTimingFunction: EASE_OUT_EXPO }}>
      {prefix}
      {/* tabular-nums keeps the digits from reflowing while counting */}
      <span className="tabular-nums">{text}</span>
      {suffix}
    </span>
  );
}
