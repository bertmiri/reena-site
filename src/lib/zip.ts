import "server-only";

import JSZip from "jszip";
import { createAdminClient } from "@/lib/supabase/admin";

export const MAX_ZIP_BYTES = 200 * 1024 * 1024; // 200 MB safety cap

export type DocRow = {
  id: string;
  original_filename: string;
  storage_path: string;
  file_size: number;
  document_categories: { name: string } | { name: string }[] | null;
};

export type ClientGroup = { clientName: string; docs: DocRow[] };

function folderSafe(name: string): string {
  return (
    name
      .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "")
      .trim()
      .replace(/\s+/g, "_")
      .slice(0, 60) || "Client"
  );
}

export type ZipResult =
  | { ok: true; buffer: Buffer; filename: string; fileCount: number }
  | { ok: false; status: number; error: string };

export async function buildZip(
  groups: ClientGroup[],
  filename: string
): Promise<ZipResult> {
  const allDocs = groups.flatMap((g) => g.docs);
  if (allDocs.length === 0) {
    return { ok: false, status: 404, error: "No documents to download." };
  }

  const totalBytes = allDocs.reduce((sum, d) => sum + (d.file_size ?? 0), 0);
  if (totalBytes > MAX_ZIP_BYTES) {
    return {
      ok: false,
      status: 413,
      error:
        "Selection too large for a single ZIP. Download fewer clients at a time.",
    };
  }

  const admin = createAdminClient();
  const zip = new JSZip();
  const usedNames = new Set<string>();

  for (const group of groups) {
    const root = folderSafe(group.clientName);
    for (const doc of group.docs) {
      const cat = Array.isArray(doc.document_categories)
        ? doc.document_categories[0]
        : doc.document_categories;
      const catFolder = folderSafe(cat?.name ?? "Other");

      let entryName = doc.original_filename;
      let n = 2;
      while (usedNames.has(`${root}/${catFolder}/${entryName}`)) {
        const dot = doc.original_filename.lastIndexOf(".");
        entryName =
          dot > 0
            ? `${doc.original_filename.slice(0, dot)} (${n})${doc.original_filename.slice(dot)}`
            : `${doc.original_filename} (${n})`;
        n++;
      }
      usedNames.add(`${root}/${catFolder}/${entryName}`);

      const { data: blob, error } = await admin.storage
        .from("client-documents")
        .download(doc.storage_path);
      if (error || !blob) {
        console.error("[zip] download failed for", doc.id, error);
        return {
          ok: false,
          status: 500,
          error: "Could not read one of the files. Please try again.",
        };
      }
      zip.file(
        `${root}/${catFolder}/${entryName}`,
        Buffer.from(await blob.arrayBuffer())
      );
    }
  }

  const buffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  return { ok: true, buffer, filename, fileCount: allDocs.length };
}

export async function buildClientZip(
  clientName: string,
  docs: DocRow[]
): Promise<ZipResult> {
  return buildZip(
    [{ clientName, docs }],
    `${folderSafe(clientName)}_Documents.zip`
  );
}
