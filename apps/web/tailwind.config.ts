import type { Config } from "tailwindcss";
const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Spec palette — premium Google civic (DESIGN.md single source of truth)
        brand: { blue: "#174EA6", navy: "#0B1F3A", light: "#E8F0FE" },
        civic: {
          900: "#0B1F3A", 800: "#174EA6", 700: "#1A5ED6", 600: "#2D6AE0",
          500: "#4A82DC", 400: "#6E9BE4", 300: "#96B9EE", 200: "#BCD2F8",
          100: "#D2E3FC", 50: "#E8F0FE",
        },
        ink: "#172033",
        muted: "#5F6368",
        success: "#188038",
        warning: "#F9AB00",
        critical: "#D93025",
        border: "#E5E7EB",
        background: "#F8FAFC",
        paper: "#F8FAFC",
        line: "#E5E7EB",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "Google Sans", "system-ui", "sans-serif"],
        display: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: { xl: "16px", "2xl": "20px", "3xl": "24px", "4xl": "28px" },
      boxShadow: {
        nav: "0 1px 3px rgba(11,31,58,0.08), 0 0 0 1px rgba(11,31,58,0.03)",
        card: "0 1px 2px rgba(23,32,51,0.06), 0 4px 16px rgba(23,32,51,0.05)",
        "card-hover": "0 12px 32px rgba(11,31,58,0.10), 0 4px 16px rgba(11,31,58,0.06)",
        soft: "0 4px 16px rgba(11,31,58,0.06)",
        map: "0 8px 30px rgba(11,31,58,0.12)",
        elevated: "0 20px 48px rgba(11,31,58,0.12), 0 8px 16px rgba(11,31,58,0.06)",
      },
      maxWidth: {
        content: "1280px",
        prose: "68ch",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "fade-in-slow": { from: { opacity: "0", transform: "translateY(10px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "blur-in": { from: { opacity: "0", filter: "blur(8px)", transform: "translateY(4px)" }, to: { opacity: "1", filter: "blur(0)", transform: "translateY(0)" } },
        shimmer: { "0%": { transform: "translateX(-100%)" }, "100%": { transform: "translateX(100%)" } },
        "beam-dash": { "0%": { strokeDashoffset: "0" }, "100%": { strokeDashoffset: "-22" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-4px)" } },
        pulse: { "0%,100%": { transform: "scale(1)", opacity: "0.92" }, "50%": { transform: "scale(1.04)", opacity: "1" } },
        "scale-in": { from: { opacity: "0", transform: "scale(0.98)" }, to: { opacity: "1", transform: "scale(1)" } },
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(calc(-50% - 0.75rem))" } },
        "aurora-shift": { "0%": { backgroundPosition: "0% 50%" }, "50%": { backgroundPosition: "100% 50%" }, "100%": { backgroundPosition: "0% 50%" } },
        "border-beam": { "100%": { offsetDistance: "100%" } },
        spin: { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } },
        "beam-slide": { from: { transform: "translateX(-100%)" }, to: { transform: "translateX(100%)" } },
      },
      animation: {
        "fade-in": "fade-in 0.55s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in-slow": "fade-in-slow 0.7s cubic-bezier(0.22,1,0.36,1) both",
        "blur-in": "blur-in 0.7s cubic-bezier(0.22,1,0.36,1) both",
        shimmer: "shimmer 1.8s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        pulse: "pulse 3.2s ease-in-out infinite",
        "scale-in": "scale-in 0.5s cubic-bezier(0.22,1,0.36,1) both",
        marquee: "marquee var(--duration,32s) linear infinite",
        "border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
        spin: "spin 5s linear infinite",
        "beam-slide": "beam-slide 2.2s linear infinite",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.22,1,0.36,1)",
        "in-out": "cubic-bezier(0.45,0,0.55,1)",
      },
    },
  },
  plugins: [],
};
export default config;
