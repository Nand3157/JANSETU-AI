"use client";
import { cn } from "@/lib/utils";

// Magic UI — Border Beam (adapted: civic palette, respects reduced-motion, masked)
// Inspired by https://github.com/magicuidesign/magicui — BorderBeam
export function BorderBeam({
  className,
  size = 220,
  duration = 6,
  borderWidth = 1,
  colorFrom = "#174EA6",
  colorTo = "#1A5ED6",
  delay = 0,
}: {
  className?: string;
  size?: number;
  duration?: number;
  borderWidth?: number;
  colorFrom?: string;
  colorTo?: string;
  delay?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] [border:calc(var(--border-width)*1px)_solid_transparent] ![mask-clip:padding-box,border-box] ![mask-composite:intersect] [mask:linear-gradient(transparent,transparent),linear-gradient(white,white)]",
        "after:absolute after:aspect-square after:w-[calc(var(--size)*1px)] after:animate-border-beam after:[background:linear-gradient(to_left,var(--color-from),var(--color-to),transparent)] after:[offset-anchor:90%_50%] after:[offset-path:rect(0_auto_auto_0_round_calc(var(--border-radius)-var(--border-width)*1px))]",
        className
      )}
      style={
        {
          "--size": size,
          "--duration": `${duration}s`,
          "--border-width": borderWidth,
          "--color-from": colorFrom,
          "--color-to": colorTo,
          "--delay": `-${delay}s`,
          "--border-radius": "20px",
        } as React.CSSProperties
      }
    />
  );
}

// Simpler civic variant — sheen that slides on hover (no offset-path dependency, fallback friendly)
export function BeamBorderAnimated({
  className,
  duration = 2.2,
}: {
  className?: string;
  duration?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        className
      )}
    >
      <div
        className="absolute inset-0 rounded-[inherit] p-[1px] [background:linear-gradient(90deg,transparent,rgba(23,78,166,0.18),rgba(23,78,166,0.32),transparent)] [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [mask-composite:exclude] [-webkit-mask-composite:xor]"
        style={{ animation: `beam-slide ${duration}s linear infinite` }}
      />
    </div>
  );
}
