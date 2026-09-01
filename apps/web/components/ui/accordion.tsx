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
    <div className="divide-y divide-[#E5E7EB] border-y border-[#E5E7EB] bg-transparent">
      {items.map((it) => {
        const isOpen = open === it.value;
        return (
          <div key={it.value} className="bg-transparent">
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`acc-${it.value}`}
              onClick={() => setOpen((v) => (v === it.value ? null : it.value))}
              className={cn(
                "group w-full flex items-center justify-between gap-3 px-0 py-4 text-left text-[14px] font-medium text-[#0B1F3A] hover:text-[#174EA6] transition-colors min-h-[44px]",
                "bg-transparent border-0 shadow-none rounded-none focus-visible:outline-none focus-visible:text-[#174EA6]"
              )}
            >
              <span>{it.trigger}</span>
              <span className={cn("h-7 w-7 rounded-full border bg-white grid place-items-center shrink-0 transition-colors", isOpen ? "border-[#174EA6] bg-[#E8F0FE]" : "border-[#E5E7EB] group-hover:border-[#CBD5E1]")}>
                <ChevronDown
                  className={cn("h-3.5 w-3.5 text-[#5F6368] shrink-0 transition-transform duration-300", isOpen && "rotate-180 text-[#174EA6]")}
                  aria-hidden="true"
                />
              </span>
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
                <div className="pb-4 pt-1 text-[13.5px] leading-relaxed text-[#5F6368] pr-8">{it.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
