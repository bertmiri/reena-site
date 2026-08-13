"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

const BACK = "/admin/settings/account";

const passwordSchema = z
  .object({
    current: z.string().min(1),
    password: z.string().min(12).max(200),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "mismatch" });

export async function changePassword(formData: FormData) {
  const parsed = passwordSchema.safeParse({
    current: formData.get("current"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    const mismatch = parsed.error.issues.some((i) => i.message === "mismatch");
    redirect(`${BACK}?error=${mismatch ? "pw_mismatch" : "pw_weak"}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    redirect("/admin/login");
  }

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.current,
  });
  if (authError) {
    redirect(`${BACK}?error=pw_current`);
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) {
    console.error("[account] password change failed:", error.message);
    redirect(`${BACK}?error=pw_failed`);
  }

  await logAudit({ action: "password_changed" });
  redirect(`${BACK}?ok=password`);
}

const emailSchema = z.object({
  newEmail: z.email(),
  current: z.string().min(1),
});

export async function changeEmail(formData: FormData) {
  const parsed = emailSchema.safeParse({
    newEmail: formData.get("new_email"),
    current: formData.get("current"),
  });
  if (!parsed.success) {
    redirect(`${BACK}?error=em_invalid`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    redirect("/admin/login");
  }

  if (parsed.data.newEmail.toLowerCase() === user.email.toLowerCase()) {
    redirect(`${BACK}?error=em_same`);
  }

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.current,
  });
  if (authError) {
    redirect(`${BACK}?error=em_password`);
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.updateUser(
    { email: parsed.data.newEmail },
    { emailRedirectTo: `${base}/auth/callback?next=${BACK}` }
  );
  if (error) {
    console.error("[account] email change failed:", error.message);
    redirect(`${BACK}?error=em_failed`);
  }

  await logAudit({
    action: "email_change_requested",
    metadata: { new_email: parsed.data.newEmail },
  });
  redirect(`${BACK}?ok=email_pending`);
}
