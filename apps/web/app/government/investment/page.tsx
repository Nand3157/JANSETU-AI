export default function InvestmentPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">Investment Gap</h1>
      <div className="grid md:grid-cols-3 gap-4">
        {[
          ["Required Investment","₹312 Cr","#0B1F3A"],
          ["Current Allocation","₹186 Cr","#174EA6"],
          ["Funding Gap","₹126 Cr","#D93025"],
        ].map(([l,v,c])=> (
          <div key={l} className="rounded-[20px] bg-white border border-[#E5E7EB] p-6">
            <div className="text-xs tracking-widest font-semibold text-[#5F6368]">{l as string}</div>
            <div className="text-2xl font-semibold mt-1" style={{ color: c as string }}>{v as string}</div>
          </div>
        ))}
      </div>
      <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-5">
        <h3 className="font-semibold">District comparison</h3>
        <div className="mt-4 space-y-2">
          {[
            ["Vadodara",186,126],
            ["Surat",142,98],
            ["Ahmedabad",210,88],
          ].map(([d,req,gap])=> (
            <div key={d as string} className="flex items-center gap-3">
              <span className="w-24 text-sm font-medium">{d as string}</span>
              <div className="flex-1 h-2 rounded-full bg-[#E5E7EB] overflow-hidden flex">
                <span className="bg-[#174EA6]" style={{ width: `${(Number(req)/312)*100}%`}} />
                <span className="bg-[#D93025]" style={{ width: `${(Number(gap)/312)*100}%`}} />
              </div>
              <span className="text-xs text-[#5F6368]">Gap ₹{gap} Cr</span>
            </div>
          ))}
        </div>
        <div className="text-xs text-[#5F6368] mt-3">Geographic map uses BigQuery GIS investment gap join.</div>
      </div>
    </div>
  );
}
