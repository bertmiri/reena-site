"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

const BACK = "/admin/settings/services";

function done(ok?: string, error?: string): never {
  revalidatePath("/", "layout");
  redirect(error ? `${BACK}?error=${error}` : `${BACK}?ok=${ok ?? "1"}`);
}

const serviceFields = z.object({
  title: z.string().trim().min(3).max(80),
  description: z.string().trim().min(5).max(400),
  sort_order: z.coerce.number().int().min(0).max(999),
});

export async function createService(formData: FormData) {
  const parsed = serviceFields.safeParse({
    title: formData.get("title") ?? "",
    description: formData.get("description") ?? "",
    sort_order: formData.get("sort_order") ?? 0,
  });
  if (!parsed.success) done(undefined, "invalid");

  const supabase = await createClient();
  const { error } = await supabase.from("services").insert(parsed.data);
  if (error) {
    console.error("[services] create failed:", error);
    done(undefined, "save");
  }
  await logAudit({ action: "service_created", metadata: { title: parsed.data.title } });
  done("created");
}

const updateFields = serviceFields.extend({
  id: z.uuid(),
  active: z.coerce.boolean(),
});

export async function updateService(formData: FormData) {
  const parsed = updateFields.safeParse({
    id: formData.get("id") ?? "",
    title: formData.get("title") ?? "",
    description: formData.get("description") ?? "",
    sort_order: formData.get("sort_order") ?? 0,
    active: formData.get("active") === "on",
  });
  if (!parsed.success) done(undefined, "invalid");

  const supabase = await createClient();
  const { id, ...fields } = parsed.data;
  const { error } = await supabase.from("services").update(fields).eq("id", id);
  if (error) {
    console.error("[services] update failed:", error);
    done(undefined, "save");
  }
  await logAudit({ action: "service_updated", metadata: { id, title: fields.title } });
  done("saved");
}

export async function deleteService(formData: FormData) {
  const parsed = z.uuid().safeParse(formData.get("id"));
  if (!parsed.success) done(undefined, "invalid");

  const supabase = await createClient();
  const { error } = await supabase.from("services").delete().eq("id", parsed.data);
  if (error) {
    console.error("[services] delete failed:", error);
    done(undefined, "save");
  }
  await logAudit({ action: "service_deleted", metadata: { id: parsed.data } });
  done("deleted");
}
