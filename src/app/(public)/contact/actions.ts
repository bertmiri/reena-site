"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { sendEnquiry } from "@/lib/contact-email";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email(),
  phone: z.string().trim().max(40).default(""),
  message: z.string().trim().min(10).max(3000),
  website: z.literal(""), // honeypot — humans leave it empty
});

export async function submitEnquiry(formData: FormData) {
  const parsed = schema.safeParse({
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    message: formData.get("message") ?? "",
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    const bot = parsed.error.issues.some((i) => i.path[0] === "website");
    // Bots get a silent "success"; humans get a helpful error.
    redirect(bot ? "/contact?sent=1" : "/contact?error=1");
  }

  const ok = await sendEnquiry(parsed.data);
  redirect(ok ? "/contact?sent=1" : "/contact?error=2");
}
