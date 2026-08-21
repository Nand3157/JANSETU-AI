export default function HealthPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">System Health</h1>
      <div className="grid md:grid-cols-3 gap-4">
        {[
          ["AI Services","Operational","Gemini / Firebase AI"],
          ["API","Operational","Cloud Run 99.9%"],
          ["Database","Operational","Firestore / BigQuery"],
          ["Maps","Operational","Geocoding / GIS"],
          ["Analytics","Operational","BigQuery GIS"],
          ["Storage","Operational","Cloud Storage"],
        ].map(([name,status,detail])=> (
          <div key={name as string} className="rounded-[20px] bg-white border border-[#E5E7EB] p-5">
            <div className="flex items-center justify-between">
              <span className="font-medium">{name as string}</span>
              <span className="h-2 w-2 rounded-full bg-[#188038] animate-pulse" />
            </div>
            <div className="text-sm text-[#188038] font-medium">{status as string}</div>
            <div className="text-xs text-[#5F6368]">{detail as string}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
