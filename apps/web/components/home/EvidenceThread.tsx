"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * EvidenceThread — the one authored moment on this page.
 *
 * JANSETU's product truth is a chain: citizen voice → AI understanding →
 * evidence fusion → priority → human decision → impact. That chain is real and
 * it is the thing a visitor must understand, so instead of six identical static
 * cards this is one thread you can walk: the spine draws once when it enters
 * view, and each stop opens what actually happens there, with the numbers the
 * rest of this page already cites and a link into the live surface.
 *
 * Semantics are tabs, not decoration: arrow keys move, Home/End jump, and the
 * panel is a real tabpanel. Reduced motion skips the draw entirely.
 */

type Step = {
  id: string;
  n: string;
  title: string;
  short: string;
  body: string;
  /** Real artefacts this step produces — never invented for the pitch. */
  facts: { label: string; value: string }[];
  href: string;
  cta: string;
  /** Step 04 renders the pinned weights as bars rather than plain facts. */
  weights?: { label: string; value: number }[];
};

const STEPS: Step[] = [
  {
    id: "voice",
    n: "01",
    title: "Citizen voice",
    short: "Speak / type / photo",
    body:
      "A citizen speaks in Gujarati, Hindi or English, types, or photographs the problem. Nothing is required beyond the need itself — location can come from a PIN code or the device.",
    facts: [
      { label: "Accepted input", value: "Voice · text · photo" },
      { label: "Languages on intake", value: "ગુજરાતી · हिन्दी · English" },
    ],
    href: "/citizen/submit",
    cta: "Raise a community need",
  },
  {
    id: "understanding",
    n: "02",
    title: "AI understanding",
    short: "Transcribe & structure",
    body:
      "Gemini 3.5 Transcribe turns the recording into text in the speaker's own language, then intake extracts category, urgency, affected groups and location — and flags what it could not determine rather than guessing.",
    facts: [
      { label: "Speech to text", value: "gemini-3.5-transcribe" },
      { label: "Ambiguity", value: "Flagged, never filled in" },
    ],
    href: "/docs",
    cta: "See the intake contract",
  },
  {
    id: "fusion",
    n: "03",
    title: "Evidence fusion",
    short: "GIS + demographics",
    body:
      "Requests are deduplicated into clusters, then joined with published evidence: Census of India demographics, infrastructure indices and the India Post PIN directory — matched by district, never by individual.",
    facts: [
      { label: "Joined datasets", value: "Census 2011 · infrastructure indices" },
      { label: "Privacy", value: "Cluster centroids only, never citizen points" },
    ],
    href: "/government/explorer",
    cta: "Open the data explorer",
  },
  {
    id: "priority",
    n: "04",
    title: "Priority intelligence",
    short: "Pinned, versioned score",
    body:
      "A deterministic formula scores every cluster. The weights are pinned and published — Gemini may explain a score, it may never change one. Sample cluster: monsoon road closure, Vadodara rural.",
    facts: [{ label: "Result", value: "78.4 / 100 · high band" }],
    weights: [
      { label: "demand", value: 92 },
      { label: "gap", value: 88 },
      { label: "population", value: 80 },
      { label: "vulnerability", value: 82 },
      { label: "urgency", value: 90 },
      { label: "feasibility", value: 64 },
    ],
    href: "/government/admin/weights",
    cta: "Read the weight policy",
  },
  {
    id: "decision",
    n: "05",
    title: "Government action",
    short: "Human review",
    body:
      "Officials see the evidence, the score and the gaps, then decide. Approving or rejecting requires an explicit, editable reason — and that reason is what gets logged, not a summary of it.",
    facts: [
      { label: "Decision", value: "Human, with a written reason" },
      { label: "Audit", value: "Every action logged" },
    ],
    href: "/government/projects",
    cta: "Open priority projects",
  },
  {
    id: "impact",
    n: "06",
    title: "Impact",
    short: "Measure change",
    body:
      "Baseline, target and actual are tracked side by side, with observed measurements separated from modelled estimates and sources attached to both.",
    facts: [
      { label: "Sample: PHC transit", value: "45 min baseline → 22 target → 28 actual" },
      { label: "Labelling", value: "Observed vs modeled, always distinct" },
    ],
    href: "/government/impact",
    cta: "Open the impact dashboard",
  },
];

export function EvidenceThread() {
  const [selected, setSelected] = useState(0);
  const [drawn, setDrawn] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // The draw: one time, when the thread enters view, skipped under reduced motion.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      setDrawn(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setDrawn(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function onKeyDown(e: React.KeyboardEvent) {
    const last = STEPS.length - 1;
    let next = selected;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = selected === last ? 0 : selected + 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = selected === 0 ? last : selected - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    else return;
    e.preventDefault();
    setSelected(next);
    tabRefs.current[next]?.focus();
  }

  const step = STEPS[selected];

  return (
    <div ref={rootRef}>
      {/* The thread. Horizontal on wide screens where the six stops are co-linear. */}
      <div className="relative hidden lg:block">
        <svg
          viewBox="0 0 1000 2"
          preserveAspectRatio="none"
          className="absolute left-[8%] right-[8%] top-[17px] h-[2px] w-[84%]"
          aria-hidden="true"
        >
          <line x1="0" y1="1" x2="1000" y2="1" stroke="#E5E7EB" strokeWidth="2" />
          <line
            x1="0"
            y1="1"
            x2="1000"
            y2="1"
            stroke="#174EA6"
            strokeWidth="2"
            strokeLinecap="round"
            style={{
              strokeDasharray: 1000,
              strokeDashoffset: drawn ? 0 : 1000,
              transition: prefersReducedMotion() ? "none" : "stroke-dashoffset 900ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        </svg>
      </div>

      <div
        role="tablist"
        aria-label="How JANSETU AI works, step by step"
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
        className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-2 lg:mx-0 lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-0"
      >
        {STEPS.map((s, i) => {
          const active = i === selected;
          const done = i < selected;
          return (
            <button
              key={s.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              id={`thread-tab-${s.id}`}
              aria-selected={active}
              aria-controls={`thread-panel-${s.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => setSelected(i)}
              className={cn(
                "group flex min-w-[132px] shrink-0 snap-start flex-col items-center gap-2 rounded-2xl px-2 py-2 text-center transition-colors lg:min-w-0",
                active ? "" : "hover:bg-white",
              )}
            >
              <span
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-full border-2 text-xs font-bold tabular-nums transition-[background-color,border-color,color,box-shadow] duration-200",
                  active
                    ? "border-[#174EA6] bg-[#174EA6] text-white shadow-[0_0_0_4px_rgba(23,78,166,0.12)]"
                    : done
                    ? "border-[#174EA6] bg-white text-[#174EA6]"
                    : "border-[#E5E7EB] bg-white text-[#5F6368] group-hover:border-[#CBD5E1]",
                )}
              >
                {done ? <Check className="h-4 w-4" aria-hidden="true" /> : s.n}
              </span>
              <span className={cn("text-[13px] font-semibold leading-tight tracking-tight transition-colors", active ? "text-[#0B1F3A]" : "text-[#172033]")}>
                {s.title}
              </span>
              <span className="text-[11.5px] leading-snug text-[#5F6368]">{s.short}</span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`thread-panel-${step.id}`}
        aria-labelledby={`thread-tab-${step.id}`}
        tabIndex={0}
        className="mt-4 rounded-[24px] border border-[#E5E7EB] bg-white p-5 md:p-7"
        data-no-hover
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-10">
          <div>
            <div className="flex items-baseline gap-3">
              <span className="text-xs font-bold tabular-nums tracking-[0.14em] text-[#174EA6]">STEP {step.n}</span>
              <h3 className="text-[19px] font-extrabold tracking-[-0.025em] text-[#0B1F3A] md:text-[22px]">{step.title}</h3>
            </div>
            <p className="mt-3 max-w-[62ch] text-[14.5px] leading-relaxed text-[#5F6368]">{step.body}</p>
            <Link
              href={step.href}
              className="mt-5 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-[#174EA6] underline-premium"
            >
              {step.cta} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="space-y-4">
            {step.weights ? (
              <ul className="space-y-2.5">
                {step.weights.map((w) => (
                  <li key={w.label} className="grid grid-cols-[92px_minmax(0,1fr)_34px] items-center gap-3">
                    <span className="text-[12.5px] font-medium text-[#172033]">{w.label}</span>
                    <span className="h-1.5 overflow-hidden rounded-full bg-[#E8F0FE]">
                      <span
                        className="block h-full origin-left rounded-full bg-[#174EA6]"
                        style={{
                          transform: `scaleX(${w.value / 100})`,
                          transition: prefersReducedMotion() ? "none" : "transform 620ms cubic-bezier(0.16, 1, 0.3, 1)",
                        }}
                      />
                    </span>
                    <span className="text-right text-[12.5px] tabular-nums text-[#5F6368]">{w.value}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            <dl className="space-y-3">
              {step.facts.map((f) => (
                <div key={f.label} className="border-t border-[#F1F5F9] pt-3 first:border-t-0 first:pt-0">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5F6368]">{f.label}</dt>
                  <dd className="mt-1 text-[13.5px] leading-snug text-[#172033]">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <p className="mt-3 text-[11.5px] text-[#5F6368]">
        Figures shown are the sample Vadodara cluster used throughout this page — labelled sample, never presented as live.
      </p>
    </div>
  );
}
