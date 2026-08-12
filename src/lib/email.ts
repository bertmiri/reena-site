import "server-only";

import { Resend } from "resend";

type SubmissionInfo = {
  clientName: string;
  reference: string;
  clientId: string;
};

/** Best-effort — an email failure must never break the client's submission. */
export async function notifySubmission(info: SubmissionInfo, count: number) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  const from = process.env.EMAIL_FROM;
  if (!key || !to || !from) {
    console.warn("[email] env vars missing — notification skipped");
    return;
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  try {
    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from,
      to,
      subject: `Documents received — ${info.clientName} (${count})`,
      text: [
        `${info.clientName} (${info.reference}) has submitted ${count} document(s).`,
        ``,
        `Review them in the portal:`,
        `${base}/admin/clients/${info.clientId}`,
        ``,
        `— RM Property Hub portal`,
      ].join("\n"),
    });
    if (error) console.error("[email] send failed:", error);
  } catch (err) {
    console.error("[email] send failed:", err);
  }
}
