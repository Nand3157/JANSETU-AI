import Link from "next/link";

export default function AdminPage() {
  const items: [string,string,string,string][] = [
    ["Users","1,240","Manage access","/government/admin/users"],
    ["Roles","6 roles","citizen → super_admin","/government/admin/roles"],
    ["Countries","5","BRICS config","/brics"],
    ["Languages","8","EN, HI, GU…","/government/admin/languages"],
    ["Categories","15","roads, water…","/government/admin"],
    ["Ranking Weights","v1","30/20/15/15/10/10","/government/admin/weights"],
    ["Data Sources","6","Verified","/government/explorer"],
    ["AI Configuration","Gemini","Prompts v1","/government/admin"],
    ["Audit Logs","1.2k","Immutable","/government/admin/audit"],
    ["System Health","5/5 OK","Operational","/government/admin/health"],
  ];
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">Administration</h1>
      <div className="grid md:grid-cols-3 gap-4">
        {items.map(([t,v,d,href])=> (
          <Link key={t} href={href} className="rounded-[20px] bg-white border border-[#E5E7EB] p-5 hover:shadow-card hover:border-[#CBD5E1] hover:-translate-y-[1px] transition-all block">
            <div className="text-xs tracking-widest font-semibold text-[#5F6368]">{t}</div>
            <div className="text-lg font-semibold mt-1">{v}</div>
            <div className="text-xs text-[#5F6368]">{d}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
