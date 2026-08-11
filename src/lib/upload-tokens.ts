import "server-only";

import { createHash, randomBytes } from "crypto";

/** Raw token goes in the link (shown once); only its SHA-256 hash is stored. */
export function generateUploadToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString("base64url");
  return { raw, hash: hashUploadToken(raw) };
}

export function hashUploadToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export const EXPIRY_OPTIONS = [1, 3, 7, 14, 30] as const;
