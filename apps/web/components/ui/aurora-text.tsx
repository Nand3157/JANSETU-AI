"use client";
import { cn } from "@/lib/utils";

// Magic UI — Aurora Text (civic palette, gradient shift)
export function AuroraText({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "bg-clip-text text-transparent inline-block",
        "[background:linear-gradient(90deg,#174EA6_0%,#2D6AE0_22%,#0B1F3A_48%,#174EA6_78%,#4A82DC_100%)] [background-size:200%_100%] animate-[aurora-shift_5.5s_ease_infinite]",
        className
      )}
      style={{ WebkitBackgroundClip: "text" } as React.CSSProperties}
    >
      {children}
    </span>
  );
}
