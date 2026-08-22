import type { Metadata } from "next";
export const metadata: Metadata = { title: "About" };
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[720px] px-4 md:px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">About JANSETU AI</h1>
      <p className="text-[#78716C] mt-3 leading-relaxed">JANSETU is not a complaint chatbot. It is a public infrastructure demand intelligence layer connecting citizen demand to evidence, prioritization, investment planning and measurable outcomes. Digital Public Good, citizen-first, privacy-preserving, fairness — never using religion, caste, politics.</p>
      <div className="mt-8 rounded-[20px] bg-white border border-[#E7E5E4] p-6 text-sm leading-relaxed text-[#78716C]">
        Frontend is untrusted. Backend owns validation, scoring, audit. Gemini recommends, humans decide. Every score is traceable to evidence and components.
      </div>
      <div className="mt-6 rounded-[20px] bg-white border border-[#E7E5E4] p-6 text-sm leading-relaxed text-[#172033]">
        <div className="text-[11px] tracking-widest font-semibold text-[#5F6368]">CONTACT</div>
        <p className="mt-2">Questions about the platform, partnerships, or BRICS deployment:</p>
        <p className="mt-3"><a href="mailto:support@jansetu.ai" className="inline-flex items-center gap-2 text-[#174EA6] underline underline-offset-2 break-all">support@jansetu.ai</a></p>
        <p className="mt-1.5"><a href="tel:+912651234567" className="inline-flex items-center gap-2 text-[#174EA6] underline underline-offset-2">+91 265 123 4567</a></p>
      </div>
    </div>
  );
}
