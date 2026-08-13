import "server-only";

import { Resend } from "resend";

type Enquiry = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

export async function sendEnquiry(enquiry: Enquiry): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  const from = process.env.EMAIL_FROM;
  if (!key || !to || !from) {
    console.warn("[contact] env vars missing — enquiry not sent");
    return false;
  }
  try {
    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: enquiry.email,
      subject: `Website enquiry — ${enquiry.name}`,
      text: [
        `Name: ${enquiry.name}`,
        `Email: ${enquiry.email}`,
        `Phone: ${enquiry.phone || "-"}`,
        ``,
        enquiry.message,
      ].join("\n"),
    });
    if (error) {
      console.error("[contact] send failed:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[contact] send failed:", err);
    return false;
  }
}
