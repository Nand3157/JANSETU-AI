const pptxgen = require("pptxgenjs");

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "JANSETU AI";
pptx.subject = "Hackathon pitch deck";
pptx.title = "JANSETU AI | From Citizen Voice to Public Action";
pptx.company = "JANSETU AI";
pptx.lang = "en-IN";
pptx.theme = {
  headFontFace: "Aptos Display",
  bodyFontFace: "Aptos",
  lang: "en-US",
};
pptx.defineSlideMaster({
  title: "MASTER",
  background: { color: "F7FAFC" },
  objects: [
    { rect: { x: 0, y: 7.18, w: 13.333, h: 0.32, fill: { color: "0F3557" }, line: { color: "0F3557" } } },
    { text: { text: "JANSETU AI  /  DIGITAL PUBLIC GOOD", options: { x: 0.55, y: 7.22, w: 4.4, h: 0.12, fontFace: "Aptos", fontSize: 6.5, bold: true, color: "FFFFFF", charSpacing: 1.2, margin: 0 } } },
    { text: { text: "HACKATHON 2026", options: { x: 10.8, y: 7.22, w: 1.95, h: 0.12, fontFace: "Aptos", fontSize: 6.5, bold: true, color: "BFE8D0", align: "right", charSpacing: 1.2, margin: 0 } } },
  ],
  slideNumber: { x: 12.87, y: 7.2, color: "FFFFFF", fontFace: "Aptos", fontSize: 7 },
});

const C = { navy: "0F3557", blue: "174EA6", green: "0F9D58", mint: "DDF4E8", sky: "E8F0FE", ink: "172033", muted: "5F6368", line: "D8E1EA", amber: "F4B942", pale: "FFF7E1", white: "FFFFFF", red: "B42318" };
const W = 13.333, H = 7.5;
function txt(slide, text, x, y, w, h, opts = {}) {
  slide.addText(text, { x, y, w, h, margin: 0, fontFace: opts.fontFace || "Aptos", fontSize: opts.fontSize || 16, color: opts.color || C.ink, bold: opts.bold || false, breakLine: false, fit: "shrink", valign: opts.valign || "mid", align: opts.align || "left", italic: opts.italic || false, charSpacing: opts.charSpacing || 0, bullet: opts.bullet, paraSpaceAfterPt: opts.paraSpaceAfterPt || 0, ...opts });
}
function rect(slide, x, y, w, h, fill, radius = 0.12, line = fill) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: radius, fill: { color: fill }, line: { color: line, transparency: line === fill ? 100 : 0, width: 1 } });
}
function line(slide, x1, y1, x2, y2, color = C.line, width = 1.2, dash = "solid") {
  slide.addShape(pptx.ShapeType.line, { x: x1, y: y1, w: x2 - x1, h: y2 - y1, line: { color, width, dashType: dash, beginArrowType: "none", endArrowType: "none" } });
}
function title(slide, kicker, heading, sub = "") {
  txt(slide, kicker.toUpperCase(), 0.62, 0.42, 4.4, 0.22, { fontSize: 9, bold: true, color: C.green, charSpacing: 1.8 });
  txt(slide, heading, 0.62, 0.78, 11.9, 0.64, { fontSize: 27, bold: true, color: C.navy });
  if (sub) txt(slide, sub, 0.64, 1.48, 11.6, 0.36, { fontSize: 11.5, color: C.muted });
}
function pill(slide, text, x, y, w, fill, color = C.navy) {
  rect(slide, x, y, w, 0.3, fill, 0.15, fill);
  txt(slide, text, x, y + 0.01, w, 0.25, { fontSize: 8.5, bold: true, color, align: "center" });
}
function metric(slide, value, label, x, y, w, fill = C.white) {
  rect(slide, x, y, w, 0.92, fill, 0.12, fill);
  txt(slide, value, x + 0.14, y + 0.12, w - 0.28, 0.38, { fontSize: 23, bold: true, color: C.navy });
  txt(slide, label, x + 0.14, y + 0.58, w - 0.28, 0.2, { fontSize: 8.5, color: C.muted });
}
function card(slide, heading, body, x, y, w, h, accent = C.blue) {
  rect(slide, x, y, w, h, C.white, 0.14, C.line);
  slide.addShape(pptx.ShapeType.rect, { x, y, w: 0.07, h, fill: { color: accent }, line: { color: accent } });
  txt(slide, heading, x + 0.22, y + 0.17, w - 0.38, 0.28, { fontSize: 14, bold: true, color: C.navy });
  txt(slide, body, x + 0.22, y + 0.55, w - 0.4, h - 0.68, { fontSize: 10.5, color: C.muted, valign: "top", breakLine: false, fit: "shrink" });
}
function arrow(slide, x, y, w, color = C.green) {
  slide.addShape(pptx.ShapeType.chevron, { x, y, w, h: 0.28, fill: { color }, line: { color, transparency: 100 } });
}
function addNotes(slide, text) { if (slide.addNotes) slide.addNotes(text); }

// 1. Cover
{
  const s = pptx.addSlide();
  s.background = { color: C.navy };
  s.addShape(pptx.ShapeType.arc, { x: 8.7, y: -1.05, w: 5.8, h: 5.8, adjustPoint: 0.3, line: { color: C.green, transparency: 35, width: 3 }, fill: { color: C.navy, transparency: 100 } });
  s.addShape(pptx.ShapeType.arc, { x: 9.55, y: -0.25, w: 4.3, h: 4.3, line: { color: C.amber, transparency: 20, width: 1.5 }, fill: { color: C.navy, transparency: 100 } });
  for (const [x, y, r, c] of [[10.4, 1.6, 0.13, C.green], [11.4, 2.3, 0.08, C.amber], [9.65, 2.55, 0.1, C.sky], [12.2, 1.2, 0.07, C.green]]) s.addShape(pptx.ShapeType.ellipse, { x, y, w: r, h: r, fill: { color: c }, line: { color: c } });
  txt(s, "JANSETU", 0.72, 0.72, 4.8, 0.38, { fontSize: 15, bold: true, color: C.mint, charSpacing: 2.2 });
  txt(s, "From citizen voice\nto public action.", 0.68, 1.58, 8.5, 1.55, { fontSize: 34, bold: true, color: C.white, valign: "top", breakLine: true });
  txt(s, "An evidence-backed civic intelligence layer that turns multilingual citizen needs into transparent, human-governed infrastructure priorities.", 0.72, 3.52, 7.1, 0.75, { fontSize: 16, color: "D8E8F3", valign: "top", breakLine: true });
  pill(s, "AI understanding", 0.72, 5.18, 1.48, "DDF4E8", C.navy);
  pill(s, "Evidence fusion", 2.32, 5.18, 1.36, "E8F0FE", C.navy);
  pill(s, "Human decision", 3.8, 5.18, 1.38, "FFF7E1", C.navy);
  txt(s, "Hackathon pitch  |  India-first demo  |  Synthetic data clearly labeled", 0.72, 6.48, 7.4, 0.25, { fontSize: 9.5, color: "AFC6D7" });
  addNotes(s, "Open with the one-line promise: JANSETU closes the gap between what citizens say and what public systems can act on.");
}

// 2. Problem
{
  const s = pptx.addSlide("MASTER"); title(s, "01 / The gap", "Citizens speak. Systems receive fragments.", "The information exists, but it is multilingual, duplicated, geographically scattered, and disconnected from investment decisions.");
  card(s, "Fragmented demand", "Voice, web forms, meetings, messaging and grievance channels create a noisy stream of requests.", 0.68, 2.18, 3.75, 1.55, C.blue);
  card(s, "Invisible patterns", "Similar issues remain separate. Hotspots and underserved communities are hard to compare fairly.", 4.78, 2.18, 3.75, 1.55, C.green);
  card(s, "Weak action loop", "A complaint may be acknowledged, but not connected to evidence, funding, delivery or measured impact.", 8.88, 2.18, 3.75, 1.55, C.amber);
  line(s, 1.3, 4.65, 11.95, 4.65, C.line, 2);
  txt(s, "The result", 0.72, 4.2, 1.4, 0.25, { fontSize: 10, bold: true, color: C.muted });
  txt(s, "High citizen effort, low institutional visibility, and prioritization that can feel opaque.", 2.05, 4.18, 8.8, 0.34, { fontSize: 18, bold: true, color: C.navy });
  pill(s, "Not another complaint chatbot", 4.58, 5.35, 2.32, C.navy, C.white);
  txt(s, "JANSETU is the intelligence layer between citizen demand and accountable public action.", 3.0, 5.95, 7.4, 0.38, { fontSize: 14, color: C.muted, align: "center" });
  addNotes(s, "Frame the problem as a coordination and evidence problem, not simply an AI problem.");
}

// 3. Solution
{
  const s = pptx.addSlide("MASTER"); title(s, "02 / The solution", "One continuous civic intelligence loop.", "JANSETU preserves citizen intent, makes evidence visible, and keeps the final decision with authorized public officials.");
  const steps = [
    ["01", "Citizen voice", "Gujarati / Hindi / English\ntext, voice, photo, location"],
    ["02", "AI understanding", "Translate, classify, summarize\nwith schema validation"],
    ["03", "Evidence fusion", "Cluster demand with\ndemographics + infrastructure"],
    ["04", "Transparent priority", "Deterministic score\nwith six stored components"],
    ["05", "Human action", "Project, budget, approval\nand measurable impact"],
  ];
  steps.forEach((a, i) => {
    const x = 0.62 + i * 2.53;
    rect(s, x, 2.28, 2.12, 2.23, i === 3 ? C.navy : C.white, 0.15, i === 3 ? C.navy : C.line);
    txt(s, a[0], x + 0.18, 2.5, 0.55, 0.32, { fontSize: 11, bold: true, color: i === 3 ? C.mint : C.green });
    txt(s, a[1], x + 0.18, 3.02, 1.75, 0.32, { fontSize: 14, bold: true, color: i === 3 ? C.white : C.navy });
    txt(s, a[2], x + 0.18, 3.55, 1.72, 0.65, { fontSize: 9.5, color: i === 3 ? "D8E8F3" : C.muted, valign: "top", breakLine: true });
    if (i < steps.length - 1) arrow(s, x + 2.17, 3.24, 0.3);
  });
  rect(s, 1.62, 5.23, 10.08, 0.72, C.mint, 0.15, C.mint);
  txt(s, "The design principle: Gemini can understand and explain. It cannot silently change weights, invent evidence, or approve funding.", 1.92, 5.44, 9.5, 0.27, { fontSize: 13, bold: true, color: C.navy, align: "center" });
}

// 4. Story
{
  const s = pptx.addSlide("MASTER"); title(s, "03 / The demo story", "A monsoon road request becomes a decision-ready case.", "A single Gujarati citizen journey demonstrates the full chain from intake to impact.");
  rect(s, 0.7, 2.08, 4.18, 3.85, C.navy, 0.2, C.navy);
  txt(s, "અમારા ગામનો રસ્તો વરસાદમાં બંધ થઈ જાય છે.", 1.02, 2.48, 3.55, 0.72, { fontSize: 19, bold: true, color: C.white, valign: "top", breakLine: true });
  txt(s, "Our village road closes in the monsoon. Reaching the hospital takes too long, and children struggle to reach school.", 1.02, 3.55, 3.42, 1.08, { fontSize: 13, color: "D8E8F3", valign: "top", breakLine: true });
  pill(s, "Gujarati  /  location-aware", 1.02, 5.23, 2.06, C.mint, C.navy);
  txt(s, "Citizen need", 1.02, 5.56, 1.6, 0.2, { fontSize: 9, color: "AFC6D7" });
  const chain = [["Understood", "roads · urgency 4/5"], ["Clustered", "4,219 related requests"], ["Scored", "78.4 · HIGH"], ["Proposed", "₹4.2 Cr estimate"]];
  chain.forEach((a, i) => {
    const y = 2.23 + i * 0.94;
    rect(s, 5.58, y, 6.42, 0.72, i === 2 ? C.sky : C.white, 0.13, i === 2 ? C.blue : C.line);
    txt(s, String(i + 1).padStart(2, "0"), 5.84, y + 0.18, 0.4, 0.25, { fontSize: 10, bold: true, color: C.green });
    txt(s, a[0], 6.42, y + 0.13, 1.65, 0.24, { fontSize: 13, bold: true, color: C.navy });
    txt(s, a[1], 8.25, y + 0.13, 3.3, 0.24, { fontSize: 12, color: C.muted });
    if (i < chain.length - 1) line(s, 6.03, y + 0.72, 6.03, y + 0.94, C.green, 1.5);
  });
  txt(s, "One story. Full chain. Human decision at the end.", 5.62, 6.24, 6.3, 0.3, { fontSize: 14, bold: true, color: C.navy, align: "center" });
}

// 5. Engine
{
  const s = pptx.addSlide("MASTER"); title(s, "04 / The intelligence", "The score is explainable by design.", "AI helps understand the request. The official priority score is calculated by a versioned deterministic engine.");
  rect(s, 0.72, 2.16, 5.15, 3.9, C.navy, 0.18, C.navy);
  txt(s, "PRIORITY SCORE v1", 1.05, 2.52, 3.5, 0.24, { fontSize: 10, bold: true, color: C.mint, charSpacing: 1.5 });
  txt(s, "78.4", 1.02, 3.0, 3.2, 0.82, { fontSize: 45, bold: true, color: C.white });
  pill(s, "HIGH", 4.35, 3.33, 0.85, C.amber, C.navy);
  txt(s, "Every component and weightVersion is persisted.\nNo opaque final score.", 1.05, 4.23, 3.9, 0.62, { fontSize: 13, color: "D8E8F3", valign: "top", breakLine: true });
  txt(s, "demand × 0.30  +  infrastructure gap × 0.20\npopulation impact × 0.15  +  vulnerability × 0.15\nurgency × 0.10  +  feasibility × 0.10", 1.05, 5.15, 4.1, 0.62, { fontSize: 10.2, color: C.mint, valign: "top", breakLine: true });
  const bars = [["Demand", 100, "30%", C.green], ["Infrastructure gap", 60, "20%", C.blue], ["Population impact", 62, "15%", "6B8FD3"], ["Vulnerability", 82, "15%", C.amber], ["Urgency", 80, "10%", "D58B24"], ["Feasibility", 68, "10%", "8BA6B8"]];
  bars.forEach((b, i) => { const y = 2.23 + i * 0.58; txt(s, b[0], 6.48, y, 1.62, 0.22, { fontSize: 10, bold: true, color: C.navy }); rect(s, 8.2, y + 0.03, 3.25, 0.17, "E7EDF2", 0.08, "E7EDF2"); rect(s, 8.2, y + 0.03, 3.25 * b[1] / 100, 0.17, b[3], 0.08, b[3]); txt(s, String(b[1]), 11.6, y - 0.01, 0.4, 0.22, { fontSize: 10, bold: true, color: C.navy, align: "right" }); txt(s, b[2], 12.12, y - 0.01, 0.46, 0.22, { fontSize: 9, color: C.muted, align: "right" }); });
  txt(s, "Top drivers: demand + vulnerability", 6.48, 5.9, 3.7, 0.28, { fontSize: 13, bold: true, color: C.green });
  txt(s, "Limiting factor: feasibility survey pending", 6.48, 6.27, 4.4, 0.24, { fontSize: 11, color: C.muted });
}

// 6. Architecture
{
  const s = pptx.addSlide("MASTER"); title(s, "05 / The build", "A clear boundary between intelligence, evidence and authority.", "Next.js experience on top of an Express API, shared schemas, governed AI orchestration and auditable data services.");
  const cols = [
    ["Citizen + government", "Next.js 14\nTailwind UI\nFirebase Auth\nMaps + dashboards", C.sky],
    ["JANSETU API", "Express + TypeScript\nValidation + RBAC\nAI orchestration\nAudit logs", C.mint],
    ["Evidence + decision", "Gemini / Firebase AI Logic\nFirestore + BigQuery GIS\nCloud Storage\nDeterministic engine", C.pale],
  ];
  cols.forEach((a, i) => { const x = 0.78 + i * 4.2; rect(s, x, 2.32, 3.45, 2.75, a[2], 0.18, a[2]); txt(s, a[0], x + 0.28, 2.65, 2.85, 0.32, { fontSize: 16, bold: true, color: C.navy }); txt(s, a[1], x + 0.28, 3.24, 2.8, 1.15, { fontSize: 12, color: C.ink, valign: "top", breakLine: true }); if (i < 2) arrow(s, x + 3.63, 3.52, 0.38); });
  rect(s, 1.28, 5.55, 10.75, 0.66, C.navy, 0.16, C.navy);
  txt(s, "Governance boundary", 1.6, 5.74, 1.65, 0.22, { fontSize: 11, bold: true, color: C.mint });
  txt(s, "Gemini may understand, classify, translate and draft. It must not invent evidence, alter weights or approve funding.", 3.38, 5.72, 8.2, 0.24, { fontSize: 11.5, color: C.white });
}

// 7. Product surfaces
{
  const s = pptx.addSlide("MASTER"); title(s, "06 / The product", "Two experiences. One accountable system.", "The citizen sees clarity and status. The public official sees evidence, trade-offs and decision controls.");
  rect(s, 0.7, 2.12, 5.72, 3.95, C.white, 0.18, C.line);
  pill(s, "CITIZEN PWA", 1.02, 2.45, 1.38, C.sky, C.blue);
  txt(s, "Make participation\nfeel possible.", 1.02, 3.04, 3.7, 0.75, { fontSize: 25, bold: true, color: C.navy, valign: "top", breakLine: true });
  const ci = ["Speak or type in your language", "Add photo and location", "Confirm AI understanding", "Track request → action"];
  ci.forEach((t, i) => { s.addShape(pptx.ShapeType.ellipse, { x: 1.05, y: 4.18 + i * 0.38, w: 0.12, h: 0.12, fill: { color: C.green }, line: { color: C.green } }); txt(s, t, 1.3, 4.11 + i * 0.38, 3.9, 0.22, { fontSize: 11, color: C.muted }); });
  rect(s, 6.88, 2.12, 5.72, 3.95, C.navy, 0.18, C.navy);
  pill(s, "GOVERNMENT WORKSPACE", 7.2, 2.45, 2.05, C.mint, C.navy);
  txt(s, "Turn evidence\ninto decisions.", 7.2, 3.04, 3.7, 0.75, { fontSize: 25, bold: true, color: C.white, valign: "top", breakLine: true });
  const gi = ["Hotspot map + priority queue", "Evidence and score breakdown", "Budget trade-off simulation", "Human approval + impact loop"];
  gi.forEach((t, i) => { s.addShape(pptx.ShapeType.ellipse, { x: 7.23, y: 4.18 + i * 0.38, w: 0.12, h: 0.12, fill: { color: C.amber }, line: { color: C.amber } }); txt(s, t, 7.48, 4.11 + i * 0.38, 4.4, 0.22, { fontSize: 11, color: "D8E8F3" }); });
  txt(s, "Trust labels throughout: AI-assisted  ·  Verified dataset  ·  Estimated  ·  Human review required", 1.2, 6.48, 10.8, 0.25, { fontSize: 11, bold: true, color: C.navy, align: "center" });
}

// 8. Results
{
  const s = pptx.addSlide("MASTER"); title(s, "07 / Proof", "The complete chain is running in the demo.", "The live harness validates the main civic workflow, including multilingual intake, governance labels and impact reporting.");
  metric(s, "32 / 32", "E2E checks passed", 0.72, 2.2, 2.2, C.mint);
  metric(s, "78.4", "Deterministic score · high", 3.18, 2.2, 2.2, C.sky);
  metric(s, "4,219", "Related requests clustered", 5.64, 2.2, 2.2, C.pale);
  metric(s, "₹4.2 Cr", "Candidate project estimate", 8.1, 2.2, 2.2, C.white);
  metric(s, "12,400", "Estimated beneficiaries", 10.56, 2.2, 2.05, C.white);
  const checks = [["Gujarati intake", "language detected, translated, preserved"], ["Evidence trace", "demographics + infrastructure + investment refs"], ["Human control", "approval and state transitions are audited"], ["Impact integrity", "observed vs estimated values separated"]];
  checks.forEach((a, i) => { const y = 3.72 + i * 0.58; s.addShape(pptx.ShapeType.ellipse, { x: 1.02, y: y + 0.07, w: 0.2, h: 0.2, fill: { color: C.green }, line: { color: C.green } }); txt(s, "✓", 1.06, y + 0.06, 0.12, 0.16, { fontSize: 9, bold: true, color: C.white, align: "center" }); txt(s, a[0], 1.45, y, 2.1, 0.25, { fontSize: 13, bold: true, color: C.navy }); txt(s, a[1], 3.75, y, 5.7, 0.25, { fontSize: 12, color: C.muted }); });
  rect(s, 9.72, 3.6, 2.55, 1.92, C.navy, 0.17, C.navy);
  txt(s, "Demo truth", 10.02, 3.91, 1.95, 0.25, { fontSize: 13, bold: true, color: C.mint, align: "center" });
  txt(s, "Synthetic data is\nclearly labeled.\nProduction connectors\nare the next step.", 10.05, 4.38, 1.9, 0.75, { fontSize: 12, color: C.white, align: "center", valign: "top", breakLine: true });
}

// 9. Governance and roadmap
{
  const s = pptx.addSlide("MASTER"); title(s, "08 / Trust + scale", "Designed for responsible adoption, not just a flashy demo.", "The prototype makes the governance contract visible while leaving a clear path to production deployment.");
  card(s, "Privacy by default", "Aggregate analytics, minimized precise location, no religion/caste/political profiling.", 0.72, 2.2, 3.72, 1.5, C.green);
  card(s, "Human-governed", "No automatic funding approval. Role-aware review, audit logs and explicit decision states.", 4.8, 2.2, 3.72, 1.5, C.blue);
  card(s, "Evidence-first", "Every score retains components, weights, evidence references, confidence and data gaps.", 8.88, 2.2, 3.72, 1.5, C.amber);
  txt(s, "Next build priorities", 0.75, 4.35, 2.6, 0.28, { fontSize: 14, bold: true, color: C.navy });
  const roadmap = [["01", "Production persistence", "Firestore reads + durable event flow"], ["02", "Real data connectors", "BigQuery GIS, investment ledger, storage"], ["03", "Secure operations", "Firebase tokens, RBAC, App Check, observability"], ["04", "Scale across regions", "Country, language, currency and policy configuration"]];
  roadmap.forEach((a, i) => { const x = 0.72 + i * 3.08; txt(s, a[0], x, 4.88, 0.35, 0.25, { fontSize: 10, bold: true, color: C.green }); txt(s, a[1], x + 0.48, 4.84, 2.42, 0.27, { fontSize: 12, bold: true, color: C.navy }); txt(s, a[2], x + 0.48, 5.27, 2.38, 0.48, { fontSize: 9.5, color: C.muted, valign: "top", breakLine: true }); if (i < 3) line(s, x + 2.72, 5.08, x + 3.02, 5.08, C.line, 1.2); });
}

// 10. Close
{
  const s = pptx.addSlide(); s.background = { color: C.navy };
  s.addShape(pptx.ShapeType.arc, { x: -1.8, y: 4.4, w: 5.4, h: 5.4, line: { color: C.green, transparency: 28, width: 3 }, fill: { color: C.navy, transparency: 100 } });
  s.addShape(pptx.ShapeType.arc, { x: 9.5, y: 4.1, w: 5.2, h: 5.2, line: { color: C.amber, transparency: 25, width: 2 }, fill: { color: C.navy, transparency: 100 } });
  txt(s, "JANSETU AI", 0.72, 0.82, 4.3, 0.3, { fontSize: 14, bold: true, color: C.mint, charSpacing: 2 });
  txt(s, "Make every citizen\nrequest count.", 0.72, 1.78, 8.6, 1.24, { fontSize: 36, bold: true, color: C.white, valign: "top", breakLine: true });
  txt(s, "A practical bridge from lived experience to evidence-backed public action.", 0.74, 3.45, 7.8, 0.4, { fontSize: 17, color: "D8E8F3" });
  rect(s, 0.74, 4.56, 4.55, 0.78, C.green, 0.16, C.green);
  txt(s, "Citizen voice  →  public value", 0.98, 4.79, 4.05, 0.25, { fontSize: 16, bold: true, color: C.white, align: "center" });
  txt(s, "Thank you", 0.74, 6.15, 2.2, 0.25, { fontSize: 13, bold: true, color: C.mint });
  txt(s, "Demo: /citizen/submit  ·  Dashboard: /government  ·  API: /health", 0.74, 6.48, 7.5, 0.22, { fontSize: 9.5, color: "AFC6D7" });
  addNotes(s, "Close on accountability: the product does not replace public authority; it helps public authority see and act on citizen demand.");
}

pptx.writeFile({ fileName: "JANSETU_AI_Hackathon_Pitch.pptx" });
