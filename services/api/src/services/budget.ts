import { store } from "./store.js";

export type Objective = "max_beneficiaries" | "max_priority" | "equity";
export type RiskTolerance = "low" | "medium" | "high";

export interface BudgetInput {
  budget: number; // INR
  objective: Objective;
  risk_tolerance: RiskTolerance;
}

export function simulateBudget(input: BudgetInput) {
  const projects = store.listProjects().filter(p=> p.estimatedCost && p.estimatedBeneficiaries && p.priorityScore);
  // Risk filter: low → feasibility >=70, medium >=55, high >=0
  const clusters = store.listClusters();
  const feasibilityByCluster = new Map(clusters.map(c=> [c.clusterId, c.feasibilityScore||68]));
  const filtered = projects.filter(p=> {
    const feas = feasibilityByCluster.get(p.clusterId) ?? 68;
    if (input.risk_tolerance==="low" && feas<70) return false;
    if (input.risk_tolerance==="medium" && feas<55) return false;
    return true;
  });

  // Sort by objective
  let sorted = [...filtered];
  if (input.objective==="max_beneficiaries") {
    sorted.sort((a,b)=> (b.estimatedBeneficiaries! / b.estimatedCost!) - (a.estimatedBeneficiaries! / a.estimatedCost!));
  } else if (input.objective==="max_priority") {
    sorted.sort((a,b)=> (b.priorityScore! / b.estimatedCost!) - (a.priorityScore! / a.estimatedCost!));
  } else if (input.objective==="equity") {
    // prioritize high vulnerability clusters: vulnerability score proxy via investmentGap
    const vuln = new Map(clusters.map(c=> [c.clusterId, c.vulnerabilityScore||50]));
    sorted.sort((a,b)=> {
      const va=vuln.get(a.clusterId)||0, vb=vuln.get(b.clusterId)||0;
      // composite: vulnerability * priority / cost
      return (vb*b.priorityScore!/b.estimatedCost! ) - (va*a.priorityScore!/a.estimatedCost!);
    });
  }

  // Greedy knapsack under budget
  let totalCost=0, totalBeneficiaries=0;
  const selected:any[]=[]; const unfunded:any[]=[];
  for (const p of sorted) {
    if (totalCost + p.estimatedCost! <= input.budget) {
      selected.push(p); totalCost+= p.estimatedCost!; totalBeneficiaries+= p.estimatedBeneficiaries!;
    } else {
      unfunded.push(p);
    }
  }
  // Also include projects filtered by risk as unfunded separately
  const excludedByRisk = projects.filter(p=> !filtered.find(f=> f.projectId===p.projectId));

  const trade_offs = `Budget ₹${(input.budget/1e7).toFixed(1)}Cr, objective ${input.objective}, risk ${input.risk_tolerance}: selected ${selected.length}/${projects.length} projects, cost ₹${(totalCost/1e7).toFixed(1)}Cr, beneficiaries ${totalBeneficiaries}. ${unfunded.length} high-priority remain unfunded (${unfunded.slice(0,2).map(u=>u.title).join("; ")||"none"}). ${excludedByRisk.length? `Excluded ${excludedByRisk.length} low-feasibility projects due to ${input.risk_tolerance} risk tolerance.`: ""}`;

  return {
    budget_constraint: input.budget,
    currency: "INR",
    objective: input.objective,
    risk_tolerance: input.risk_tolerance,
    projects_considered: projects.length,
    projects_filtered_by_risk: filtered.length,
    selected_projects: selected,
    total_cost: totalCost,
    estimated_beneficiaries: totalBeneficiaries,
    unfunded_high_priority: unfunded,
    excluded_by_risk: excludedByRisk,
    trade_offs,
    assumptions: ["Costs are ESTIMATES requiring engineering validation","Beneficiaries modeled from demographics","Feasibility from terrain/investment gap proxy"],
    data_gaps: ["Live fiscal ledger not connected","Ward-level vulnerability missing"],
    human_review_notice: "This is an AI-assisted recommendation. Final funding decisions remain with the authorized public authority.",
  };
}
