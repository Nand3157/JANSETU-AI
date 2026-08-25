import { cn } from "@/lib/utils";
const map: Record<string,string> = {
  critical: "bg-[#D93025] text-white",
  high: "bg-[#F9AB00] text-[#172033]",
  moderate: "bg-[#174EA6] text-white",
  low: "bg-[#E5E7EB] text-[#5F6368]",
  ai: "bg-[#174EA6] text-white",
  verified: "bg-[#188038] text-white",
  estimate: "bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]",
  navy: "bg-[#0B1F3A] text-white",
};
export function Badge({ tone="low", className, ...p }: React.HTMLAttributes<HTMLSpanElement> & { tone?: string }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium tracking-wide", map[tone]||map.low, className)} {...p} />;
}
