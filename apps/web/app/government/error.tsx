"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GovernmentError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("[Government error]", error); }, [error]);
  return (
    <div className="p-6">
      <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-6 max-w-[560px]">
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 rounded-xl bg-red-50 border border-red-200 grid place-items-center"><AlertTriangle className="h-5 w-5 text-red-600" /></span>
          <div>
            <div className="font-semibold">Dashboard error</div>
            <div className="text-sm text-[#5F6368]">A component crashed. This is caught — please retry.</div>
          </div>
        </div>
        {error?.message && <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs font-mono break-all">{String(error.message).slice(0, 500)}</div>}
        <div className="mt-4 flex gap-2">
          <Button size="sm" onClick={() => reset()}><RefreshCw className="h-3.5 w-3.5" /> Retry</Button>
          <Button size="sm" variant="secondary" onClick={() => location.reload()}>Reload page</Button>
        </div>
      </div>
    </div>
  );
}
