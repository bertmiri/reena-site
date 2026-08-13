"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

const BACK = "/admin/settings/loan";

const schema = z
  .object({
    rate: z.coerce.number().min(0.1).max(15),
    down: z.coerce.number().min(0).max(90),
    tenureDefault: z.coerce.number().int().min(1).max(50),
    tenureMin: z.coerce.number().int().min(1).max(50),
    tenureMax: z.coerce.number().int().min(1).max(50),
  })
  .refine((v) => v.tenureMin <= v.tenureDefault && v.tenureDefault <= v.tenureMax, {
    message: "order",
  });

export async function updateLoanSettings(formData: FormData) {
  const parsed = schema.safeParse({
    rate: formData.get("rate"),
    down: formData.get("down"),
    tenureDefault: formData.get("tenure_default"),
    tenureMin: formData.get("tenure_min"),
    tenureMax: formData.get("tenure_max"),
  });
  if (!parsed.success) {
    const order = parsed.error.issues.some((i) => i.message === "order");
    redirect(`${BACK}?error=${order ? "order" : "invalid"}`);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("loan_settings")
    .update({
      default_interest_rate: parsed.data.rate,
      default_down_payment: parsed.data.down,
      default_tenure: parsed.data.tenureDefault,
      minimum_tenure: parsed.data.tenureMin,
      maximum_tenure: parsed.data.tenureMax,
    })
    .eq("id", true);

  if (error) {
    console.error("[loan-settings] update failed:", error);
    redirect(`${BACK}?error=failed`);
  }

  await logAudit({ action: "loan_settings_changed", metadata: parsed.data });
  revalidatePath("/loan-calculator");
  redirect(`${BACK}?ok=1`);
}
