"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export async function requestPasswordReset(formData: FormData) {
  const parsed = z.email().safeParse(formData.get("email"));

  // Always show the same confirmation — never reveal whether an
  // email address has an account (prevents enumeration).
  if (parsed.success) {
    const supabase = await createClient();
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${base}/auth/callback?next=/admin/reset-password`,
    });
  }

  redirect("/admin/forgot-password?sent=1");
}
