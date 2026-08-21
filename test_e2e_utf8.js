const API = "http://localhost:8080";
const guText = "અમારા ગામનો રસ્તો વરસાદમાં બંધ થઈ જાય છે. હોસ્પિટલ જવા માટે ખૂબ સમય લાગે છે અને બાળકોને પણ સ્કૂલ જવામાં મુશ્કેલી પડે છે.";
async function run(){
  console.log("Testing Gujarati intake with proper UTF8...");
  // create
  let res = await fetch(`${API}/api/requests`, {
    method: "POST",
    headers: { "Content-Type":"application/json", "x-role":"citizen", "x-country":"IN" },
    body: JSON.stringify({ originalText: guText, sourceLanguage: "gu", latitude:22.3072, longitude:73.1812, locationSource:"user_text" })
  });
  let created = await res.json();
  console.log("CREATED:", JSON.stringify(created, null, 2));
  let rid = created.requestId;
  res = await fetch(`${API}/api/requests/${rid}/analyze`, { method:"POST" });
  let analyzed = await res.json();
  console.log("\nANALYZED:", JSON.stringify(analyzed, null, 2));
  console.log("\n--- VALIDATIONS ---");
  console.log("intake category:", analyzed.intake.category);
  console.log("intake source_language:", analyzed.intake.source_language);
  console.log("clusterId:", analyzed.cluster.clusterId, "title:", analyzed.cluster.title);
  console.log("priority:", analyzed.priority.priority_score, analyzed.priority.band);
  console.log("components:", analyzed.priority.components);
  console.log("\nExpected: category roads, source_language gu, cluster cl_vadodara_roads_01, priority ~78.4 high");

  // test cluster list
  res = await fetch(`${API}/api/clusters`);
  let cl = await res.json();
  console.log("\nCLUSTERS count:", cl.clusters.length);
  cl.clusters.forEach(c=> console.log(`- ${c.clusterId} ${c.title} ${c.priorityScore} ${c.priorityBand} req=${c.requestCount}`));

  // test copilot
  res = await fetch(`${API}/api/copilot`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({question:"Which projects should we prioritize within ₹10 Cr?"})});
  let cop = await res.json();
  console.log("\nCOPILOT (budget):", JSON.stringify(cop, null, 2).slice(0,2000));

  // test project generate
  let targetCluster = cl.clusters.find(c=>c.clusterId==="cl_vadodara_roads_01") || cl.clusters[0];
  console.log("\nGenerating project for", targetCluster.clusterId);
  res = await fetch(`${API}/api/projects/generate`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({clusterId: targetCluster.clusterId})});
  let proj = await res.json();
  console.log("PROJECT:", JSON.stringify(proj, null,2));

  // analytics
  res = await fetch(`${API}/api/analytics/kpis`);
  console.log("\nKPIs:", JSON.stringify(await res.json(), null,2));
  res = await fetch(`${API}/api/analytics/hotspots`);
  console.log("\nHOTSPOTS geojson features:", (await res.json()).geojson.features.length);
}
run().catch(e=>{ console.error(e); process.exit(1)});
