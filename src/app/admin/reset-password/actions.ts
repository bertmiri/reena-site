"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

const schema = z
  .object({
    password: z.string().min(12).max(200),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "mismatch" });

export async function setNewPassword(formData: FormData) {
  const parsed = schema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });

  if (!parsed.success) {
    const mismatch = parsed.error.issues.some((i) => i.message === "mismatch");
    redirect(
      `/admin/reset-password?error=${mismatch ? "mismatch" : "weak"}`
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/forgot-password?error=expired");
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    console.error("[reset-password] update failed:", error.message);
    redirect("/admin/reset-password?error=failed");
  }

  await logAudit({ action: "password_changed_via_reset" });
  redirect("/admin?pw=updated");
}
