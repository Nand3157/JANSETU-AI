import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-[720px] px-4 md:px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="text-sm text-[#5F6368] mt-2">Summary for the JANSETU AI demo. The full policy governs production use.</p>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-[#172033]">
        <p><strong>What we collect.</strong> The need you express (voice, text, or photo), approximate location you choose to share, and your preferred language.</p>
        <p><strong>What we never do.</strong> We do not use religion, caste, or political affiliation for any scoring or prioritization decision. Voice recordings are transcribed and are not used to build personal profiles.</p>
        <p><strong>Location is a choice.</strong> Device GPS coordinates are only read with explicit consent; village/locality text works just as well.</p>
        <p><strong>AI limits.</strong> AI assists understanding and clustering. Every recommendation is traceable to evidence and is reviewed by an authorized human authority before action.</p>
        <p>Questions? <a href="mailto:support@jansetu.ai" className="text-[#174EA6] underline underline-offset-2">support@jansetu.ai</a></p>
      </div>
    </div>
  );
}
