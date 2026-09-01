"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Animate UI / Radix — Accordion (accessible, CSS height anim, civic)
export function Accordion({
  items,
}: {
  items: { value: string; trigger: React.ReactNode; content: React.ReactNode }[];
}) {
  const [open, setOpen] = useState<string | null>(items[0]?.value ?? null);
  return (
    <div className="divide-y divide-[#E5E7EB] rounded-[16px] border border-[#E5E7EB] bg-white overflow-hidden">
      {items.map((it) => {
        const isOpen = open === it.value;
        return (
          <div key={it.value} className="bg-white">
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`acc-${it.value}`}
              onClick={() => setOpen((v) => (v === it.value ? null : it.value))}
              className={cn(
                "w-full flex items-center justify-between gap-3 px-4 md:px-5 py-4 text-left text-[13.5px] font-semibold text-[#0B1F3A] hover:bg-[#F8FAFC] transition-colors",
                isOpen && "bg-[#F8FAFC]"
              )}
            >
              <span>{it.trigger}</span>
              <ChevronDown
                className={cn("h-4 w-4 text-[#5F6368] shrink-0 transition-transform duration-300", isOpen && "rotate-180 text-[#174EA6]")}
                aria-hidden="true"
              />
            </button>
            <div
              id={`acc-${it.value}`}
              role="region"
              aria-hidden={!isOpen}
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <div className="px-4 md:px-5 pb-4 pt-0 text-[13.5px] leading-relaxed text-[#5F6368]">{it.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
