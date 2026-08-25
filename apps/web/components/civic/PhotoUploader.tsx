"use client";
import { useState, useEffect } from "react";
import { Camera, X, UploadCloud } from "lucide-react";
import { toast } from "@/components/ui/toast";

export function PhotoUploader({ onFile }: { onFile: (file: File | null, previewUrl?: string)=>void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  // M-07 fix: revoke object URL on unmount or change to prevent leak
  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    if (!f) {
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null); setName(null); onFile(null); return;
    }
    // Validate file type/size before creating URL
    if (!f.type.startsWith("image/")) { onFile(null); return; }
    if (f.size > 5 * 1024 * 1024) { toast("Photo must be 5MB or smaller.", "error"); return; }
    setName(f.name);
    if (preview) URL.revokeObjectURL(preview);
    const url = URL.createObjectURL(f);
    setPreview(url);
    onFile(f, url);
    // In prod: upload to Cloud Storage via signed URL + store photoUrl in Firestore
  }

  function handleRemove() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null); setName(null); onFile(null);
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Photo <span className="text-muted font-normal">· optional · stored in Cloud Storage, not PII</span></label>
      {!preview ? (
        <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm cursor-pointer hover:bg-white hover:border-civic-200 transition">
          <UploadCloud className="h-6 w-6 text-muted" aria-hidden="true" />
          <span>Add photo of the issue</span>
          <span className="text-xs text-muted">JPG/PNG · max 5MB</span>
          <input type="file" accept="image/*" onChange={onChange} className="hidden" />
        </label>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white">
          <img src={preview} alt={`Photo of reported civic issue — ${name || 'citizen upload'}`} width={640} height={360} loading="lazy" className="h-48 w-full object-cover" />
          <button aria-label="Remove photo" onClick={handleRemove} className="absolute top-2 right-2 h-11 w-11 rounded-full bg-black/60 text-white grid place-items-center"><X className="h-4 w-4" aria-hidden="true" /></button>
          <div className="p-2 flex items-center gap-1.5 text-xs text-muted"><Camera className="h-3.5 w-3.5" aria-hidden="true" /> {name} · uploaded on submit</div>
        </div>
      )}
    </div>
  );
}
