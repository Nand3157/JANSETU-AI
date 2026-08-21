export default function RolesPage() {
  const roles = [
    ["citizen","Can submit requests, track own, view impact"],
    ["analyst","Can view clusters, upload datasets, trigger scoring"],
    ["policymaker","Can review projects, simulate budget, approve"],
    ["program_manager","Can manage implementation, impact measurement"],
    ["admin","Can manage users, config, weights"],
    ["super_admin","Full system access"],
  ];
  return (
    <div className="space-y-4 max-w-[640px]">
      <h1 className="text-xl font-semibold tracking-tight">Roles</h1>
      <div className="space-y-2">
        {roles.map(([role,desc])=> (
          <div key={role as string} className="rounded-[16px] bg-white border border-[#E5E7EB] p-4 flex justify-between gap-4">
            <div><div className="font-medium text-sm">{role as string}</div><div className="text-xs text-[#5F6368]">{desc as string}</div></div>
            <span className="h-6 px-2.5 inline-flex items-center rounded-full bg-[#F8FAFC] border border-[#E5E7EB] text-xs">{role as string}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
