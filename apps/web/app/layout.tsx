import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "JANSETU AI — Civic Intelligence",
  description: "Citizen voice → AI understanding → Evidence fusion → Transparent prioritization → Human decision → Impact",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/75 border-b border-slate-200">
            <div className="mx-auto max-w-[1280px] px-4 md:px-6 h-[64px] flex items-center justify-between gap-4">
              <a href="/" className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-civic-800 grid place-items-center text-white font-black tracking-tighter">J</div>
                <div>
                  <div className="font-bold leading-none tracking-tight text-civic-900">JANSETU AI</div>
                  <div className="text-[11px] tracking-widest text-muted -mt-0.5">JAN SETU · PEOPLE'S BRIDGE</div>
                </div>
              </a>
              <nav className="hidden md:flex items-center gap-6 text-sm">
                <a href="/citizen" className="hover:text-civic-700">Citizen</a>
                <a href="/government" className="hover:text-civic-700">Government</a>
                <a href="/citizen/submit" className="hover:text-civic-700">Submit</a>
              </nav>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live Demo · Mock Data
                </span>
                <a href="/government" className="hidden md:inline-flex h-9 px-4 items-center rounded-xl bg-civic-700 text-white text-sm font-medium">Policymaker Login</a>
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-slate-200 bg-white">
            <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted">
              <span>Digital Public Good · Citizen-first · Evidence-first · Human-governed</span>
              <span>This is an AI-assisted recommendation. Final decisions remain with the authorized public authority.</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
