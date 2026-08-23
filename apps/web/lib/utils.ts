import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export const API = process.env.NEXT_PUBLIC_API_URL || ""; // relative in prod so /api uses Vercel rewrite; set NEXT_PUBLIC_API_URL in Vercel dashboard for external API
