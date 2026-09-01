import { cn } from "@/lib/utils";

// Cult UI / Aceternity — Dot Pattern background (very subtle civic, light)
export function DotPattern({
  className,
  dotColor = "rgba(23,78,166,0.08)",
  size = 22,
}: {
  className?: string;
  dotColor?: string;
  size?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, ${dotColor} 1px, transparent 0)`,
        backgroundSize: `${size}px ${size}px`,
      }}
    />
  );
}

export function GridPattern({
  className,
  color = "rgba(23,78,166,0.04)",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
        backgroundSize: "28px 28px",
      }}
    />
  );
}
