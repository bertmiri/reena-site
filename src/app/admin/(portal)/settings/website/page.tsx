import { getSiteSettings } from "@/lib/site-settings";
import { updateWebsiteSettings } from "./actions";

export const metadata = {
  title: "Website Settings",
  robots: { index: false, follow: false },
};

export default async function WebsiteSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;
  const s = await getSiteSettings();

  const inputClass =
    "w-full rounded-md border border-sand bg-white px-3.5 py-2.5 text-ink focus:border-gold";
  const labelClass = "mb-1.5 block text-sm font-medium text-ink";

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display text-3xl text-ink">Website</h1>
      <div className="thread-divider mt-3 w-24" />
      <p className="mt-4 text-sm text-stone">
        These details appear across the public website — header, pages and
        footer. Changes go live within a few minutes.
      </p>

      {ok && (
        <p className="mt-6 rounded-md border border-gold/40 bg-champagne/50 px-3.5 py-2.5 text-sm text-ink">
          Website updated.
        </p>
      )}
      {error && (
        <p className="mt-6 rounded-md border border-hibiscus/30 bg-hibiscus/5 px-3.5 py-2.5 text-sm text-hibiscus-deep">
          {error === "save"
            ? "Could not save. Try again."
            : `Please check the "${error}" field. WhatsApp must be digits only (e.g. 60176561191); links must be full URLs.`}
        </p>
      )}

      <form action={updateWebsiteSettings} className="mt-8 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="agent_name" className={labelClass}>Name</label>
            <input id="agent_name" name="agent_name" required defaultValue={s.agent_name} className={inputClass} />
          </div>
          <div>
            <label htmlFor="agent_title" className={labelClass}>Title</label>
            <input id="agent_title" name="agent_title" required defaultValue={s.agent_title} className={inputClass} />
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="ren" className={labelClass}>REN number</label>
            <input id="ren" name="ren" required defaultValue={s.ren} className={inputClass} />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>Public email</label>
            <input id="email" name="email" type="email" required defaultValue={s.email} className={inputClass} />
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className={labelClass}>Phone (display)</label>
            <input id="phone" name="phone" required defaultValue={s.phone} className={inputClass} />
          </div>
          <div>
            <label htmlFor="whatsapp" className={labelClass}>WhatsApp (digits only)</label>
            <input id="whatsapp" name="whatsapp" required pattern="\d{8,15}" defaultValue={s.whatsapp} className={inputClass} />
          </div>
        </div>
        <div>
          <label htmlFor="hero_heading" className={labelClass}>Homepage headline</label>
          <input id="hero_heading" name="hero_heading" required maxLength={120} defaultValue={s.hero_heading} className={inputClass} />
        </div>
        <div>
          <label htmlFor="bio_short" className={labelClass}>Short bio (About page)</label>
          <textarea id="bio_short" name="bio_short" required rows={4} maxLength={600} defaultValue={s.bio_short} className={inputClass} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="facebook" className={labelClass}>Facebook URL</label>
            <input id="facebook" name="facebook" type="url" required defaultValue={s.facebook} className={inputClass} />
          </div>
          <div>
            <label htmlFor="instagram" className={labelClass}>Instagram URL</label>
            <input id="instagram" name="instagram" type="url" required defaultValue={s.instagram} className={inputClass} />
          </div>
        </div>

        <button type="submit" className="rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink-soft">
          Save Website
        </button>
      </form>
    </div>
  );
}
