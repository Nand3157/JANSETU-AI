"use client";
import { useInView } from "@/lib/useInView";
import { cn } from "@/lib/utils";

// React Bits — BlurText (character/word stagger, civic)
// Inspired by https://github.com/DavidHDev/react-bits — BlurText
export function BlurText({
  text,
  className,
  delay = 0,
  stagger = 0.03,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
}) {
  const { ref, inView } = useInView<HTMLElement>(0.12);
  const words = text.split(" ");
  return (
    // @ts-ignore
    <Tag ref={ref as any} className={cn("inline-flex flex-wrap", className)} aria-label={text}>
      {words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          className={cn(
            "inline-block will-change-[filter,opacity,transform] transition-[filter,opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
            inView ? "opacity-100 blur-0 translate-y-0" : "opacity-0 blur-[8px] translate-y-2"
          )}
          style={{ transitionDelay: `${delay + i * stagger}s` }}
        >
          {w}
          {i < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </Tag>
  );
}

export function BlurLine({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.15);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}s` }}
      className={cn(
        "transition-[filter,opacity,transform] duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[filter,opacity,transform]",
        inView ? "opacity-100 blur-0 translate-y-0" : "opacity-0 blur-[6px] translate-y-2",
        className
      )}
    >
      {children}
    </div>
  );
}
