"use client";
import { useInView } from "@/lib/useInView";

export function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}s` }}
      className={`${className} transition-[opacity,transform] duration-500 ease-out ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2.5"}`}
    >
      {children}
    </div>
  );
}

export function StaggerCard({ children, index = 0 }: { children: React.ReactNode; index?: number }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${index * 0.06}s` }}
      className={`h-full transition-[opacity,transform] duration-500 ease-out ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
    >
      {children}
    </div>
  );
}
