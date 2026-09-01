"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Magic UI — Shimmer Button (adapted civic) + indie-ui / eldora subtle sheen
export function ShimmerButton({
  children,
  className,
  shimmerClassName,
  href,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  shimmerClassName?: string;
  href?: string;
  children: React.ReactNode;
}) {
  const inner = (
    <>
      {/* civic base */}
      <span className="relative z-[1] inline-flex items-center gap-2">{children}</span>
      {/* shimmer sheen — slides on hover */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden rounded-full",
          "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_ease-in-out_infinite] before:[background:linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.55)_50%,transparent_70%)] before:opacity-0 group-hover:before:opacity-100",
          shimmerClassName
        )}
      />
      {/* border beam subtle */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full p-[1px] opacity-0 group-hover:opacity-100 transition-opacity [background:linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)] [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [mask-composite:exclude] [-webkit-mask-composite:xor]"
      />
    </>
  );

  const cls = cn(
    "group relative inline-flex items-center justify-center rounded-full bg-[#174EA6] text-white font-semibold shadow-sm hover:bg-[#0B1F3A] hover:shadow-md hover:-translate-y-[1px] active:scale-[0.98] transition-[background-color,box-shadow,transform] duration-200 overflow-hidden",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174EA6]/60 focus-visible:ring-offset-2",
    className
  );

  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }} className={cls} {...(props as any)}>
      {inner}
    </button>
  );
}
