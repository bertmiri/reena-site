"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import { CLIENT_STATUSES } from "@/lib/clients";

const clientFields = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().max(160).default(""),
  phone: z.string().trim().max(40).default(""),
  notes: z.string().trim().max(5000).default(""),
});

function normalizeEmail(raw: string): string | null | "invalid" {
  if (!raw) return null;
  const parsed = z.email().safeParse(raw);
  return parsed.success ? parsed.data : "invalid";
}

/** Unambiguous chars only (no O/0, I/1/L). Crypto-random. */
function generateReference(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  let suffix = "";
  for (const b of bytes) suffix += chars[b % chars.length];
  return `RM-${new Date().getFullYear()}-${suffix}`;
}

export async function createClientRecord(formData: FormData) {
  const parsed = clientFields.safeParse({
    full_name: formData.get("full_name") ?? "",
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) {
    redirect("/admin/clients/new?error=Please+check+the+form+fields");
  }

  const email = normalizeEmail(parsed.data.email);
  if (email === "invalid") {
    redirect("/admin/clients/new?error=Invalid+email+address");
  }

  const supabase = await createClient();

  let created: { id: string } | null = null;
  for (let attempt = 0; attempt < 3 && !created; attempt++) {
    const { data, error } = await supabase
      .from("clients")
      .insert({
        full_name: parsed.data.full_name,
        email,
        phone: parsed.data.phone || null,
        notes: parsed.data.notes || null,
        application_reference: generateReference(),
      })
      .select("id")
      .single();

    if (data) {
      created = data;
    } else if (error && error.code !== "23505") {
      console.error("[clients] create failed:", error);
      redirect("/admin/clients/new?error=Could+not+create+client");
    }
  }
  if (!created) {
    redirect("/admin/clients/new?error=Could+not+create+client");
  }

  await logAudit({ action: "client_created", clientId: created.id });
  revalidatePath("/admin/clients");
  redirect(`/admin/clients/${created.id}`);
}

const updateSchema = clientFields.extend({
  id: z.uuid(),
  status: z.enum(CLIENT_STATUSES),
});

export async function updateClientRecord(formData: FormData) {
  const parsed = updateSchema.safeParse({
    id: formData.get("id") ?? "",
    full_name: formData.get("full_name") ?? "",
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    notes: formData.get("notes") ?? "",
    status: formData.get("status") ?? "",
  });
  if (!parsed.success) {
    redirect("/admin/clients?error=Invalid+update");
  }

  const back = `/admin/clients/${parsed.data.id}`;
  const email = normalizeEmail(parsed.data.email);
  if (email === "invalid") {
    redirect(`${back}?error=Invalid+email+address`);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("clients")
    .update({
      full_name: parsed.data.full_name,
      email,
      phone: parsed.data.phone || null,
      notes: parsed.data.notes || null,
      status: parsed.data.status,
    })
    .eq("id", parsed.data.id);

  if (error) {
    console.error("[clients] update failed:", error);
    redirect(`${back}?error=Could+not+save+changes`);
  }

  await logAudit({ action: "client_updated", clientId: parsed.data.id });
  revalidatePath("/admin/clients");
  revalidatePath(back);
  redirect(`${back}?saved=1`);
}
