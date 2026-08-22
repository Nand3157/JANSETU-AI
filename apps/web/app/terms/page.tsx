import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Use" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-[720px] px-4 md:px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Terms of Use</h1>
      <p className="text-sm text-[#5F6368] mt-2">Summary for the JANSETU AI demo. The full terms govern production use.</p>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-[#172033]">
        <p><strong>What JANSETU is.</strong> A public intelligence layer that turns citizen needs into evidence-backed priorities. It is advisory — final decisions rest solely with the authorized public authority.</p>
        <p><strong>Fair use.</strong> Submit genuine community needs. Do not submit false reports, spam, or content that is abusive or unlawful.</p>
        <p><strong>Demo data.</strong> This deployment uses mock datasets and mock authentication for demonstration; no real government decisions are made from it.</p>
        <p><strong>No guarantee.</strong> Scores, gaps, and projections are estimates to support deliberation, not commitments of funding or works.</p>
        <p>Contact: <a href="mailto:support@jansetu.ai" className="text-[#174EA6] underline underline-offset-2">support@jansetu.ai</a> · <a href="tel:+912651234567" className="text-[#174EA6] underline underline-offset-2">+91 265 123 4567</a></p>
      </div>
    </div>
  );
}
