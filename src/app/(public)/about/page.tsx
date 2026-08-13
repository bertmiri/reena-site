import type { Metadata } from "next";
import Image from "next/image";
import { getSiteSettings, whatsappLink } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "About",
  description: "Reena Mazlan — Real Estate Negotiator, RM Property Hub, Miri.",
};

export default async function AboutPage() {
  const settings = await getSiteSettings();
  return (
    <main className="bg-night text-paper">
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <Image src="/brand/logo.jpg" alt="RM Property Hub" width={220} height={220} className="mx-auto mix-blend-screen" />
        <h1 className="mt-2 font-display text-4xl text-paper">{settings.agent_name}</h1>
        <p className="mt-2 text-xs tracking-[0.3em] text-gold-bright">
          {settings.agent_title.toUpperCase()} · {settings.ren}
        </p>
        <div className="thread-divider mx-auto mt-6 w-24 opacity-70" />
        <p className="mx-auto mt-8 max-w-md leading-relaxed text-paper/70">
          {settings.bio_short}
        </p>
        <p className="mx-auto mt-4 max-w-md text-sm text-paper/50">
          Based in Miri, Sarawak — serving home buyers, sellers and investors
          across the region.
        </p>
        <p className="mt-10">
          <a href={whatsappLink(settings)} target="_blank" rel="noopener" className="inline-block rounded-md bg-gold px-6 py-3 font-medium text-night transition-colors hover:bg-gold-bright">Let&apos;s Talk</a>
        </p>
      </div>
    </main>
  );
}
