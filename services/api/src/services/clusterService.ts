/**
 * Cluster Service v2 — precision over aggressive merging
 * Considers: semantic TF-IDF cosine, geographic haversine, category, time context, underlying problem
 * Prefer splitting materially different problems even with shared keywords.
 */

export function haversineKm(lat1:number, lon1:number, lat2:number, lon2:number): number {
  const R=6371, dLat=(lat2-lat1)*Math.PI/180, dLon=(lon2-lon1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(a));
}

function tokenize(s:string): string[] {
  return s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(w=> w.length>2);
}

function tfVector(tokens:string[]): Map<string,number> {
  const m=new Map<string,number>(); tokens.forEach(t=> m.set(t,(m.get(t)||0)+1));
  const norm=Math.sqrt([...m.values()].reduce((a,c)=> a + c*c, 0)) || 1;
  // normalize
  for (const k of m.keys()) m.set(k, (m.get(k)!)/norm);
  return m;
}

export function cosineSimilarity(a:string, b:string): number {
  const va=tfVector(tokenize(a)), vb=tfVector(tokenize(b));
  let dot=0; for (const [k,av] of va) dot+= av * (vb.get(k)||0);
  return Math.max(0, Math.min(1, dot));
}

export interface ClusterCandidate {
  clusterId: string; title:string; summary:string; category:string; centroid:{lat:number,lng:number}|null; requestCount:number;
}

export function scoreMatch(
  newText: string, newCategory:string, newLat:number|null, newLng:number|null,
  candidate: ClusterCandidate
): { score:number; breakdown:{semantic:number; geo:number; category:boolean; reasons:string[]}} {
  const semantic = cosineSimilarity(newText, `${candidate.title} ${candidate.summary}`);
  let geoScore = 0.5; // if no coords, neutral
  let reasons:string[]=[];
  if (newLat!=null && newLng!=null && candidate.centroid) {
    const km=haversineKm(newLat,newLng,candidate.centroid.lat,candidate.centroid.lng);
    geoScore = Math.max(0, 1 - km/25); // 0km→1, 25km→0
    reasons.push(`geo ${km.toFixed(1)}km → ${geoScore.toFixed(2)}`);
  } else {
    reasons.push("geo neutral (missing coords)");
  }
  const category = newCategory===candidate.category;
  if (category) reasons.push(`same category ${newCategory}`); else reasons.push(`category mismatch ${newCategory} vs ${candidate.category}`);
  reasons.push(`semantic ${semantic.toFixed(2)} "${candidate.title.slice(0,30)}"`);

  // weighted: semantic 0.5, geo 0.3, category 0.2 (category mismatch heavily penalizes)
  const score = semantic*0.5 + geoScore*0.3 + (category?0.2:0);
  return { score, breakdown:{semantic,geo:geoScore,category,reasons}};
}

export function decide(existing: ClusterCandidate[], newText:string, cat:string, lat:number|null, lng:number|null, threshold=0.62): { decision:"MATCH_EXISTING"|"CREATE_NEW"|"UNCERTAIN"; candidateId:string|null; score:number; reasons:string[] } {
  if (existing.length===0) return { decision:"CREATE_NEW", candidateId:null, score:0, reasons:["no existing clusters"] };
  let bestScore=0; let bestId:string|null=null; let bestReasons:string[]=[];
  let bestSemantic=0, bestGeo=0, bestCat=false;
  for (const c of existing) {
    const r=scoreMatch(newText,cat,lat,lng,c);
    if (r.score>bestScore) { bestScore=r.score; bestId=c.clusterId; bestReasons=r.breakdown.reasons; bestSemantic=r.breakdown.semantic; bestGeo=r.breakdown.geo; bestCat=r.breakdown.category; }
  }
  if (bestScore>=threshold && bestCat && bestSemantic>0.35) {
    return { decision:"MATCH_EXISTING", candidateId:bestId, score:bestScore, reasons:bestReasons };
  }
  if (bestScore>=threshold-0.12 && bestScore<threshold) {
    return { decision:"UNCERTAIN", candidateId:bestId, score:bestScore, reasons: [...bestReasons, "near threshold — needs human review"] };
  }
  return { decision:"CREATE_NEW", candidateId:null, score:bestScore, reasons:[...bestReasons, `best ${bestScore.toFixed(2)} < ${threshold}`] };
}
