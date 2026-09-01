"use client";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Aceternity — Spotlight / Cult UI — spotlight card (mouse tracking radial)
export function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(23,78,166,0.12)",
  size = 420,
}: {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  size?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0, opacity: 0 });

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top, opacity: 1 });
  }
  function onLeave() {
    setPos((p) => ({ ...p, opacity: 0 }));
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn("relative overflow-hidden isolation-auto", className)}
      style={{ "--spot-x": `${pos.x}px`, "--spot-y": `${pos.y}px`, "--spot-opacity": pos.opacity, "--spot-size": `${size}px`, "--spot-color": spotlightColor } as React.CSSProperties}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[var(--spot-opacity)] transition-opacity duration-300"
        style={{
          background: `radial-gradient(var(--spot-size) circle at var(--spot-x) var(--spot-y), var(--spot-color), transparent 70%)`,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

// Aceternity — Background Beams alternative: subtle moving beams via CSS
export function SpotlightOverlay({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        "bg-[radial-gradient(520px_circle_at_50%_0%,rgba(23,78,166,0.08),transparent_62%)]",
        className
      )}
    />
  );
}
