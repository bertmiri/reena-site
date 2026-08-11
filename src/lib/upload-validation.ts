export const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB
export const MAX_FILE_LABEL = "25 MB";

export const ALLOWED_EXTENSIONS = [
  "pdf", "jpg", "jpeg", "png", "doc", "docx", "xls", "xlsx", "heic",
] as const;

export const ACCEPT_ATTR = ".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.heic";

const MIME_BY_EXT: Record<string, string[]> = {
  pdf: ["application/pdf"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  png: ["image/png"],
  doc: ["application/msword"],
  docx: [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  xls: ["application/vnd.ms-excel"],
  xlsx: [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  heic: ["image/heic", "image/heif"],
};

export function getExtension(filename: string): string | null {
  const idx = filename.lastIndexOf(".");
  if (idx === -1 || idx === filename.length - 1) return null;
  return filename.slice(idx + 1).toLowerCase();
}

export type FileCheck =
  | { ok: true; ext: string }
  | { ok: false; reason: string };

export function validateFile(
  name: string,
  mimeType: string,
  size: number
): FileCheck {
  const ext = getExtension(name);
  if (!ext || !(ALLOWED_EXTENSIONS as readonly string[]).includes(ext)) {
    return { ok: false, reason: "File type not allowed (PDF, images, Word or Excel only)." };
  }
  if (size > MAX_FILE_BYTES) {
    return { ok: false, reason: `File is larger than ${MAX_FILE_LABEL}.` };
  }
  if (size === 0) {
    return { ok: false, reason: "File is empty." };
  }
  const allowedMimes = MIME_BY_EXT[ext] ?? [];
  if (mimeType && !allowedMimes.includes(mimeType)) {
    return { ok: false, reason: "File content does not match its extension." };
  }
  return { ok: true, ext };
}

/** Display-safe filename: no paths, control chars or angle brackets. */
export function sanitizeFilename(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "document";
  const cleaned = base.replace(/[\u0000-\u001f<>"']/g, "").trim();
  return cleaned.slice(0, 120) || "document";
}
