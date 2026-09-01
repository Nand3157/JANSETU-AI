"use client";
import { cn } from "@/lib/utils";

// Magic UI — Marquee (infinite scroll, civic)
export function Marquee({
  children,
  className,
  pauseOnHover = true,
  reverse = false,
  duration = "32s",
}: {
  children: React.ReactNode;
  className?: string;
  pauseOnHover?: boolean;
  reverse?: boolean;
  duration?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden [--duration:32s] [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]", className)}>
      <div
        className={cn(
          "flex w-max min-w-full shrink-0 animate-marquee items-center gap-3",
          pauseOnHover && "hover:[animation-play-state:paused]",
          reverse && "[animation-direction:reverse]"
        )}
        style={{ ["--duration" as any]: duration } as React.CSSProperties}
      >
        {/* duplicate for seamless loop */}
        <div className="flex gap-3 shrink-0">{children}</div>
        <div aria-hidden="true" className="flex gap-3 shrink-0">
          {children}
        </div>
      </div>
    </div>
  );
}

export function MarqueeItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("shrink-0 rounded-full bg-white border border-[#E5E7EB] px-3.5 py-2 text-sm shadow-sm", className)}>{children}</div>;
}
