export default function ExplorerPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">Data Explorer</h1>
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
            <div className="text-xs text-[#5F6368] mt-1">Owner: Analyst · Updated 21 Aug 2026</div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <span className="rounded-full bg-[#F8FAFC] border border-[#E5E7EB] px-2 py-1 text-center">{rows as string}</span>
              <span className="rounded-full bg-[#F8FAFC] border border-[#E5E7EB] px-2 py-1 text-center">{coverage as string}</span>
            </div>
            <div className="mt-2 text-xs"><span className={`px-2 py-1 rounded-full border text-xs ${quality==="Verified"?"bg-[#E6F4EA] text-[#188038] border-[#CEEAD6]":"bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]"}`}>{quality as string}</span></div>
          </div>
        ))}
      </div>
      <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-6">
        <h3 className="font-semibold">Upload dataset</h3>
        <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
          <label className="block">Dataset Name<input placeholder="Infrastructure Index 2026" className="mt-1 w-full rounded-full border border-[#E5E7EB] px-4 py-2.5" /></label>
          <label className="block">Type<select className="mt-1 w-full rounded-full border border-[#E5E7EB] bg-white px-4 py-2.5"><option>Infrastructure</option><option>Demographics</option></select></label>
          <label className="block">File<input type="file" className="mt-1 w-full rounded-full border border-[#E5E7EB] px-4 py-2.5" /></label>
          <label className="block">Geography<input placeholder="Vadodara" className="mt-1 w-full rounded-full border border-[#E5E7EB] px-4 py-2.5" /></label>
        </div>
        <div className="mt-4 flex gap-2">
          <button className="h-10 px-5 rounded-full bg-[#174EA6] text-white text-sm font-medium">Validate Dataset</button>
          <button className="h-10 px-5 rounded-full border border-[#E5E7EB] bg-white text-sm">Publish Dataset</button>
        </div>
      </div>
    </div>
  );
}
