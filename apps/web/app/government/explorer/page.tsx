"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toast";

export default function ExplorerPage() {
  const [datasetName, setDatasetName] = useState("");
  const [type, setType] = useState("Infrastructure");
  const [geo, setGeo] = useState("");
  const [validating, setValidating] = useState(false);

  async function validate() {
    if (!datasetName.trim()) { toast("Enter a dataset name first.", "error"); return; }
    setValidating(true);
    try {
      await api("/api/upload", { method:"POST", body: JSON.stringify({ filename: datasetName, type, geography: geo }) });
      toast("Dataset validated — ready to publish (demo).", "success");
    } catch(e:any){ toast(e.message, "error"); }
    finally { setValidating(false); }
  }
  async function publish() {
    if (!datasetName.trim()) { toast("Enter a dataset name first.", "error"); return; }
    try {
      await api("/api/upload", { method:"POST", body: JSON.stringify({ filename: datasetName, type, geography: geo }) });
      toast("Dataset published — visible in explorer (demo persistence).", "success");
    } catch(e:any){ toast(e.message, "error"); }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">Data Explorer</h1>
      <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 inline-flex gap-1">Demo mode — datasets are synthetic and uploads are demo-persisted</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          ["Citizen Requests","4,218 rows","Vadodara","Verified"],
          ["Demographics","1,240 rows","Gujarat","Verified"],
          ["Infrastructure","890 rows","Gujarat","Verified"],
          ["Investment Plans","42 rows","All","Verified"],
          ["Projects","18 rows","—","Draft"],
          ["Impact Metrics","264 rows","—","Modeled"],
        ].map(([name,rows,coverage,quality])=> (
          <div key={name as string} className="rounded-[20px] bg-white border border-[#E5E7EB] p-5">
            <div className="font-medium">{name as string}</div>
            <div className="text-xs text-[#5F6368] mt-1">Owner: Analyst · Updated 21 Aug 2026 · Sample</div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <span className="rounded-full bg-[#F8FAFC] border border-[#E5E7EB] px-2 py-1 text-center tabular-nums">{rows as string}</span>
              <span className="rounded-full bg-[#F8FAFC] border border-[#E5E7EB] px-2 py-1 text-center">{coverage as string}</span>
            </div>
            <div className="mt-2 text-xs"><span className={`px-2 py-1 rounded-full border text-xs ${quality==="Verified"?"bg-[#E6F4EA] text-[#188038] border-[#CEEAD6]":"bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]"}`}>{quality as string}</span></div>
          </div>
        ))}
      </div>
      <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-6">
        <h3 className="font-semibold">Upload dataset</h3>
        <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
          <label className="block">Dataset Name<input value={datasetName} onChange={e=> setDatasetName(e.target.value)} placeholder="Infrastructure Index 2026…" className="mt-1 w-full rounded-full border border-[#E5E7EB] bg-white px-4 py-2.5 text-[16px] md:text-sm" /></label>
          <label className="block">Type<select value={type} onChange={e=> setType(e.target.value)} className="mt-1 w-full rounded-full border border-[#E5E7EB] bg-white px-4 py-2.5 text-[16px] md:text-sm"><option>Infrastructure</option><option>Demographics</option></select></label>
          <label className="block">File<input type="file" onChange={()=> toast("File selected — validation will handle upload (demo).","info")} className="mt-1 w-full rounded-full border border-[#E5E7EB] px-4 py-2.5 text-sm" /></label>
          <label className="block">Geography<input value={geo} onChange={e=> setGeo(e.target.value)} placeholder="Vadodara…" className="mt-1 w-full rounded-full border border-[#E5E7EB] bg-white px-4 py-2.5 text-[16px] md:text-sm" /></label>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={validate} disabled={validating} className="h-11 px-5 rounded-full bg-[#174EA6] text-white text-sm font-medium disabled:opacity-60 min-h-11">{validating ? "Validating…" : "Validate Dataset"}</button>
          <button onClick={publish} className="h-11 px-5 rounded-full border border-[#E5E7EB] bg-white text-sm min-h-11">Publish Dataset</button>
        </div>
      </div>
    </div>
  );
}
