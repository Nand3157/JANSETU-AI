import type { Config } from "tailwindcss";
const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Spec palette — premium Google civic
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
        nav: "0 1px 3px rgba(11,31,58,0.08)",
        card: "0 1px 3px rgba(23,32,51,0.07), 0 4px 12px rgba(23,32,51,0.06)",
        "card-hover": "0 8px 24px rgba(11,31,58,0.10), 0 4px 12px rgba(11,31,58,0.06)",
        soft: "0 4px 16px rgba(11,31,58,0.06)",
        map: "0 8px 30px rgba(11,31,58,0.12)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0", transform: "translateY(6px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "blur-in": { from: { opacity: "0", filter: "blur(6px)" }, to: { opacity: "1", filter: "blur(0)" } },
        shimmer: { "0%": { transform: "translateX(-100%)" }, "100%": { transform: "translateX(100%)" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-4px)" } },
        pulse: { "0%,100%": { transform: "scale(1)", opacity: "0.9" }, "50%": { transform: "scale(1.05)", opacity: "1" } },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease both",
        "blur-in": "blur-in 0.6s ease both",
        shimmer: "shimmer 1.6s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        pulse: "pulse 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
