import type { Metadata } from "next";
import { getSiteSettings, whatsappLink } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Secure Document Upload",
  description: "Upload your supporting documents securely to RM Property Hub.",
};

export default async function UploadDocumentsPage() {
  const settings = await getSiteSettings();
  return (
    <main className="bg-night text-paper">
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <p className="text-xs tracking-[0.25em] text-gold-bright">SECURE UPLOAD</p>
        <h1 className="mt-3 font-display text-4xl text-paper">Your documents, protected</h1>
        <div className="thread-divider mx-auto mt-5 w-24 opacity-70" />
        <p className="mx-auto mt-8 max-w-md leading-relaxed text-paper/70">
          When we work together, I send you a personal secure link on WhatsApp.
          Open it, upload your documents, done — no account, no passwords.
        </p>
        <p className="mx-auto mt-4 max-w-md text-sm text-paper/75">
          Every link is private to you, expires automatically, and your files
          are stored encrypted — only I can access them.
        </p>
        <p className="mt-10">
          <a href={whatsappLink(settings, "Hi Reena, I need an upload link for my documents.")} target="_blank" rel="noopener" className="inline-block rounded-md bg-gold px-6 py-3 font-medium text-night transition-colors hover:bg-gold-bright">Request My Link on WhatsApp</a>
        </p>
      </div>
    </main>
  );
}
