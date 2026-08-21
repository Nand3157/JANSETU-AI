export default function UsersPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">Users</h1>
      <div className="rounded-[20px] bg-white border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-xs text-[#5F6368]"><tr><th className="text-left px-4 py-3">User</th><th className="text-left px-3 py-3">Role</th><th className="text-left px-3 py-3">Region</th><th className="text-left px-4 py-3">Last Login</th></tr></thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {[
                ["Priya S.", "citizen", "Vadodara", "2h ago"],
                ["A. Patel (Analyst)", "analyst", "Gujarat", "1h ago"],
                ["R. Mehta (Policymaker)", "policymaker", "Gujarat", "now"],
              ].map(([n,r,reg,last])=> (
                <tr key={n as string} className="hover:bg-[#F8FAFC]"><td className="px-4 py-3 font-medium">{n as string}</td><td className="px-3 py-3"><span className="px-2 py-1 rounded-full bg-[#E8F0FE] text-[#174EA6] text-xs">{r as string}</span></td><td className="px-3 py-3 text-xs text-[#5F6368]">{reg as string}</td><td className="px-4 py-3 text-xs text-[#5F6368]">{last as string}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
