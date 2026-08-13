"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

const BACK = "/admin/settings/website";

const schema = z.object({
  agent_name: z.string().trim().min(2).max(80),
  agent_title: z.string().trim().min(2).max(80),
  ren: z.string().trim().min(2).max(40),
  phone: z.string().trim().min(6).max(30),
  whatsapp: z.string().trim().regex(/^\d{8,15}$/),
  email: z.email(),
  hero_heading: z.string().trim().min(5).max(120),
  bio_short: z.string().trim().min(10).max(600),
  facebook: z.url().max(200),
  instagram: z.url().max(200),
});

export async function updateWebsiteSettings(formData: FormData) {
  const parsed = schema.safeParse({
    agent_name: formData.get("agent_name") ?? "",
    agent_title: formData.get("agent_title") ?? "",
    ren: formData.get("ren") ?? "",
    phone: formData.get("phone") ?? "",
    whatsapp: formData.get("whatsapp") ?? "",
    email: formData.get("email") ?? "",
    hero_heading: formData.get("hero_heading") ?? "",
    bio_short: formData.get("bio_short") ?? "",
    facebook: formData.get("facebook") ?? "",
    instagram: formData.get("instagram") ?? "",
  });

  if (!parsed.success) {
    const field = String(parsed.error.issues[0]?.path[0] ?? "form");
    redirect(`${BACK}?error=${encodeURIComponent(field)}`);
  }

  const supabase = await createClient();
  const rows = Object.entries(parsed.data).map(([key, value]) => ({
    key,
    value,
  }));
  const { error } = await supabase
    .from("website_settings")
    .upsert(rows, { onConflict: "key" });

  if (error) {
    console.error("[website-settings] upsert failed:", error);
    redirect(`${BACK}?error=save`);
  }

  await logAudit({
    action: "website_settings_changed",
    metadata: { keys: rows.map((r) => r.key) },
  });
  revalidatePath("/", "layout");
  redirect(`${BACK}?ok=1`);
}
