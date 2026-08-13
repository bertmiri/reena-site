import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { hashUploadToken } from "@/lib/upload-tokens";

export type ValidUploadRequest = {
  requestId: string;
  clientId: string;
  clientName: string;
  reference: string;
  message: string | null;
  expiresAt: string;
  categories: {
    id: string;
    name: string;
    description: string | null;
    status: string;
  }[];
};

const TOKEN_SHAPE = /^[A-Za-z0-9_-]{40,50}$/;

export async function validateUploadToken(
  raw: string
): Promise<ValidUploadRequest | null> {
  if (!TOKEN_SHAPE.test(raw)) {
    console.warn("[upload-validate] token shape rejected, length:", raw.length);
    return null;
  }

  const admin = createAdminClient();
  const { data: request, error } = await admin
    .from("upload_requests")
    .select(
      "id, client_id, status, expires_at, message, clients(full_name, application_reference), upload_request_documents(status, document_categories(id, name, description))"
    )
    .eq("token_hash", hashUploadToken(raw))
    .single();

  if (error) {
    // PGRST116 = no row matched the token hash; that is the normal
    // "invalid/unknown link" path, not an error worth logging.
    if (error.code !== "PGRST116") {
      console.error("[upload-validate] query error:", error.code, error.message);
    }
    return null;
  }
  if (!request) {
    console.warn("[upload-validate] no matching token hash");
    return null;
  }
  if (request.status !== "active") {
    console.warn("[upload-validate] status is", request.status);
    return null;
  }
  if (new Date(request.expires_at) < new Date()) {
    console.warn("[upload-validate] expired at", request.expires_at);
    return null;
  }

  const client = Array.isArray(request.clients)
    ? request.clients[0]
    : request.clients;
  if (!client) {
    console.warn("[upload-validate] client join empty");
    return null;
  }

  const categories = (request.upload_request_documents ?? [])
    .map((row) => {
      const cat = Array.isArray(row.document_categories)
        ? row.document_categories[0]
        : row.document_categories;
      if (!cat) return null;
      return {
        id: cat.id,
        name: cat.name,
        description: cat.description,
        status: row.status,
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  return {
    requestId: request.id,
    clientId: request.client_id,
    clientName: client.full_name,
    reference: client.application_reference,
    message: request.message,
    expiresAt: request.expires_at,
    categories,
  };
}
