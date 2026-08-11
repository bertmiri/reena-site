import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

type AuditParams = {
  action: string;
  clientId?: string;
  documentId?: string;
  metadata?: Record<string, unknown>;
};

/**
 * Best-effort audit logging — never throws, never blocks the main action.
 */
export async function logAudit({
  action,
  clientId,
  documentId,
  metadata,
}: AuditParams) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

    await supabase.from("audit_logs").insert({
      user_id: user?.id ?? null,
      action,
      client_id: clientId ?? null,
      document_id: documentId ?? null,
      metadata: metadata ?? null,
      ip_address: ip,
    });
  } catch (err) {
    console.error("[audit] logging failed:", err);
  }
}
