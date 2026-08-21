"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg" | "icon";
const variantClasses: Record<Variant,string> = {
  primary: "bg-[#174EA6] text-white hover:bg-[#0B1F3A] hover:shadow-md hover:-translate-y-[1px] shadow-sm font-medium",
  secondary: "bg-white text-[#172033] border border-[#E5E7EB] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] hover:-translate-y-[1px] hover:shadow-sm",
  ghost: "bg-transparent text-[#5F6368] hover:bg-[#F8FAFC] hover:text-[#172033]",
  outline: "border border-[#174EA6] text-[#174EA6] hover:bg-[#E8F0FE] hover:-translate-y-[1px]",
};
const sizeClasses: Record<Size,string> = {
  sm: "h-9 px-3.5 text-[13px]", md: "h-10 px-5 text-sm", lg: "h-[44px] px-7 text-[15px]", icon: "h-10 w-10 p-0"
};
export function Button({ variant="primary", size="md", className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button className={cn("inline-flex items-center justify-center rounded-full tracking-[-0.01em] transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174EA6]/20 will-change-transform", variantClasses[variant], sizeClasses[size], className)} {...props} />;
}
