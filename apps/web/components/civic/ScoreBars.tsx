"use client";
import { motion } from "framer-motion";
const factors = [
  { key: "Citizen Demand", weight: "30%", color: "bg-civic-700" },
  { key: "Infrastructure Gap", weight: "20%", color: "bg-sky-600" },
  { key: "Population Impact", weight: "15%", color: "bg-teal-600" },
  { key: "Vulnerability", weight: "15%", color: "bg-amber-500" },
  { key: "Urgency", weight: "10%", color: "bg-rose-500" },
  { key: "Feasibility", weight: "10%", color: "bg-emerald-600" },
] as const;

export function ScoreBars({ components }: { components: Record<string, number> }) {
  // map component keys to display
  const values: Record<string, number> = {
    "Citizen Demand": components.demand ?? components["demand"] ?? 0,
    "Infrastructure Gap": components.infrastructure_gap ?? 0,
    "Population Impact": components.population_impact ?? 0,
    "Vulnerability": components.vulnerability ?? 0,
    "Urgency": components.urgency ?? 0,
    "Feasibility": components.feasibility ?? 0,
  };
  return (
    <div className="space-y-3">
      {factors.map((f,i)=> {
        const v = values[f.key]||0;
        return (
          <div key={f.key} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">{f.key} <span className="text-muted font-normal">· {f.weight}</span></span>
              <span className="font-semibold text-ink">{v}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <motion.div initial={{ width: 0 }} whileInView={{ width: `${v}%` }} viewport={{ once: true }} transition={{ duration: 0.9, delay: i*0.06, ease: "easeOut" }} className={`h-full rounded-full ${f.color}`} />
            </div>
          </div>
        );
      })}
      <p className="text-[11px] text-muted pt-1">Weights v1 — Gemini may explain but never alter them. Deterministic backend score.</p>
    </div>
  );
}
