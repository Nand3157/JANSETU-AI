import { Badge } from "@/components/ui/badge";
export function TrustLabels() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge tone="ai">AI-assisted</Badge>
      <Badge tone="verified">Verified dataset</Badge>
      <Badge tone="estimate">Estimated</Badge>
      <span className="inline-flex items-center gap-1 text-xs text-muted border border-slate-200 rounded-full px-2.5 py-1 bg-white">Human review required</span>
    </div>
  );
}
