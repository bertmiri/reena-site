import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type SiteSettings = {
  agent_name: string;
  agent_title: string;
  ren: string;
  phone: string;
  whatsapp: string;
  email: string;
  hero_heading: string;
  hero_sub: string;
  bio_short: string;
  facebook: string;
  instagram: string;
  telegram: string;
};

export const SITE_DEFAULTS: SiteSettings = {
  agent_name: "Reena Mazlan",
  agent_title: "Real Estate Negotiator",
  ren: "REN74305",
  phone: "+60 17-656 1191",
  whatsapp: "60176561191",
  email: "reena.mazlan@yahoo.com",
  hero_heading: "Your trusted property advisor in Miri.",
  hero_sub:
    "Buying, selling or financing a home in Sarawak — guided personally, from first viewing to final signature.",
  bio_short:
    "Committed, friendly and trusted. I provide one-stop property services covering every aspect of your journey — so you always know the next step.",
  facebook: "https://www.facebook.com/rynnamazlan",
  instagram: "https://www.instagram.com/rynnnr__",
  telegram: "https://t.me/Reena_Mazlan",
};

/** DB values (website_settings key/value) override the defaults above. */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const admin = createAdminClient();
    const { data } = await admin.from("website_settings").select("key, value");
    const merged = { ...SITE_DEFAULTS };
    for (const row of data ?? []) {
      if (row.key in merged && typeof row.value === "string" && row.value) {
        merged[row.key as keyof SiteSettings] = row.value;
      }
    }
    return merged;
  } catch {
    return SITE_DEFAULTS;
  }
}

export function whatsappLink(s: SiteSettings, text?: string): string {
  const base = `https://wa.me/${s.whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
