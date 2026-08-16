import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteSettings, whatsappLink } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Services",
  description: "Property buying, selling, investment and financing assistance in Miri.",
};

export const revalidate = 300;

export default async function ServicesPage() {
  const settings = await getSiteSettings();
  const admin = createAdminClient();
  const { data: services } = await admin
    .from("services")
    .select("id, title, description")
    .eq("active", true)
    .order("sort_order");

  return (
    <main className="bg-night text-paper">
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <p className="text-xs tracking-[0.25em] text-gold-bright">SERVICES</p>
          <h1 className="mt-3 font-display text-4xl text-paper">How I can help</h1>
          <div className="thread-divider mx-auto mt-5 w-24 opacity-70" />
        </div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-gold/20 bg-gold/20 md:grid-cols-2">
          {(services ?? []).map((s) => (
            <div key={s.id} className="bg-night-soft px-8 py-10">
              <div className="thread-divider w-10" />
              <h2 className="mt-4 font-display text-2xl text-gold-bright">{s.title}</h2>
              <p className="mt-2 leading-relaxed text-paper/80">{s.description}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center">
          <a href={whatsappLink(settings, "Hi Reena, I would like to ask about your services.")} target="_blank" rel="noopener" className="inline-block rounded-md bg-gold px-6 py-3 font-medium text-night transition-colors hover:bg-gold-bright">Ask About a Service</a>
        </p>
      </div>
    </main>
  );
}
