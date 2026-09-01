"use client";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

// React Bits — Tilted Card / COSS tilt (mouse 3D, glare, civic)
export function TiltCard({
  children,
  className,
  intensity = 8,
  glare = true,
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({ opacity: 0 });

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rx = ((y - cy) / cy) * -intensity;
    const ry = ((x - cx) / cx) * intensity;
    setStyle({
      transform: `perspective(980px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`,
      transition: "transform 0.08s linear",
    });
    if (glare) {
      setGlareStyle({
        opacity: 1,
        background: `radial-gradient(520px circle at ${x}px ${y}px, rgba(255,255,255,0.22), transparent 62%)`,
      });
    }
  }
  function onLeave() {
    setStyle({ transform: "perspective(980px) rotateX(0deg) rotateY(0deg)", transition: "transform 0.45s cubic-bezier(0.22,1,0.36,1)" });
    setGlareStyle({ opacity: 0 });
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn("relative will-change-transform", className)}
      style={style}
    >
      {children}
      {glare && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden transition-opacity duration-300" style={glareStyle} />
      )}
    </div>
  );
}
