export default function LanguagesPage() {
  return (
    <div className="space-y-4 max-w-[640px]">
      <h1 className="text-xl font-semibold tracking-tight">Languages</h1>
      <p className="text-sm text-[#5F6368]">Multilingual: detect, preserve, normalize, translate without changing intent.</p>
      <div className="grid md:grid-cols-2 gap-3">
        {[
          ["English","en","100%"],
          ["हिन्दी","hi","100%"],
          ["ગુજરાતી","gu","100%"],
          ["Português (BR)","pt-BR","BRICS"],
          ["Русский","ru","BRICS"],
        ].map(([name,code,cov])=> (
          <div key={code as string} className="rounded-[16px] bg-white border border-[#E5E7EB] p-4">
            <div className="font-medium">{name as string} <span className="text-xs text-[#5F6368]">· {code as string}</span></div>
            <div className="text-xs text-[#5F6368]">Coverage: {cov as string}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
