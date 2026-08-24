"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProjectError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    console.error("[Project page error]", error);
  }, [error]);

  return (
    <div className="p-6">
      <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-6 max-w-[560px]">
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200 grid place-items-center"><AlertTriangle className="h-5 w-5 text-amber-700" /></span>
          <div>
            <div className="font-semibold">Something went wrong</div>
            <div className="text-sm text-[#5F6368]">The project view crashed. This is now caught so you don’t see a blank screen.</div>
          </div>
        </div>
        {error?.message && <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs font-mono break-all text-[#5F6368]">{String(error.message).slice(0, 400)}</div>}
        <div className="mt-4 flex gap-2">
          <Button size="sm" onClick={() => reset()}><RefreshCw className="h-3.5 w-3.5" /> Try again</Button>
          <Button size="sm" variant="secondary" onClick={() => router.push("/government/projects")}><ArrowLeft className="h-3.5 w-3.5" /> Back to projects</Button>
        </div>
        <div className="mt-3 text-[11px] text-muted">If this repeats, check the browser console for details — error is logged, not swallowed.</div>
      </div>
    </div>
  );
}
