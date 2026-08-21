export default function ForGov() {
  return (
    <div className="mx-auto max-w-[880px] px-4 md:px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">For Governments</h1>
      <p className="text-[#78716C] mt-2">KPI dashboard, demand hotspot map, issue clusters, priority projects, evidence explorer, copilot, budget simulator, impact.</p>
      <div className="mt-8 rounded-[20px] bg-white border border-[#E7E5E4] p-6">
        <div className="text-sm font-medium">Premium desktop-first dashboard</div>
        <div className="text-sm text-[#78716C] mt-1">Filters: country → region → district → sector → time. Human-governed, audit-logged.</div>
        <a href="/government" className="mt-4 inline-flex h-10 px-5 items-center rounded-full bg-black text-white text-sm">Open Dashboard</a>
      </div>
    </div>
  );
}
