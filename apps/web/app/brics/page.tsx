export default function BricsPage() {
  return (
    <div className="mx-auto max-w-[880px] px-4 md:px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Built for diverse communities. Designed to scale across borders.</h1>
      <p className="text-[#78716C] mt-2">BRICS strategy: India-first demo, country-specific languages, hierarchy, currency, datasets.</p>
      <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {["Brazil","Russia","India","China","South Africa"].map(c=> (
          <div key={c} className="rounded-[20px] bg-white border border-[#E7E5E4] p-5">
            <div className="font-medium">{c}</div><div className="text-sm text-[#78716C]">Local configuration ready</div>
          </div>
        ))}
      </div>
    </div>
  );
}
