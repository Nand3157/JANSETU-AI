/**
 * Motion tokens for JANSETU AI.
 *
 * One vocabulary for the whole product: durations that express consequence and
 * a single deceleration curve. DESIGN.md bans JS animation libraries, so these
 * mirror the CSS custom properties in globals.css and feed the two places that
 * animate in JS (the metric counter, and controls that must read the user's
 * preference before acting) — nothing here depends on a framework.
 *
 * This is deliberately not a second animation layer: section entrances already
 * live in components/home/HomeMotion.tsx, and this file adds no competing one.
 *
 * Rules this file encodes:
 *  - Exit faster than entrance, so feedback never feels like latency.
 *  - Keep the authored entrance rare (500–800 ms) and routine state changes fast.
 *  - Nothing animates width/height/top/left; transform and opacity only.
 */

export const MOTION = {
  /** Immediate feedback: press, hover, toggle. */
  instant: 120,
  /** Routine state change: nav active pill, chip select, field focus. */
  fast: 180,
  /** Layout, panel, overlay, view transition. */
  base: 280,
  /** Deliberately authored focal entrance. */
  slow: 520,
  /** The one long moment — the evidence thread draw. */
  focal: 900,
} as const;

/** Confident deceleration without bounce. */
export const EASE_OUT_EXPO = "cubic-bezier(0.16, 1, 0.3, 1)";
export const EASE_OUT_SOFT = "cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * Read the OS motion preference without needing a hook (SSR-safe).
 * Defaults to "motion allowed" when there is no window — matching the CSS
 * default, so the first paint is never a hidden page.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

