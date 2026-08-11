"use client";

import { useRef, useState } from "react";
import {
  ACCEPT_ATTR,
  MAX_FILE_LABEL,
  validateFile,
} from "@/lib/upload-validation";

type Category = { id: string; name: string; description: string | null };

type Entry = {
  key: string;
  name: string;
  sizeLabel: string;
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
};

type DoneState = { reference: string; documentCount: number };

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function uploadWithProgress(
  url: string,
  file: File,
  categoryId: string,
  onProgress: (pct: number) => void
): Promise<{ ok: boolean; error?: string }> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ ok: true });
      } else {
        try {
          resolve({ ok: false, error: JSON.parse(xhr.responseText).error });
        } catch {
          resolve({ ok: false, error: "Upload failed. Please try again." });
        }
      }
    };
    xhr.onerror = () =>
      resolve({ ok: false, error: "Network error. Please try again." });
    const form = new FormData();
    form.append("file", file);
    form.append("category_id", categoryId);
    xhr.send(form);
  });
}

export function Uploader({
  token,
  categories,
}: {
  token: string;
  categories: Category[];
}) {
  const [entries, setEntries] = useState<Record<string, Entry[]>>({});
  const [done, setDone] = useState<DoneState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const counter = useRef(0);

  const patch = (categoryId: string, key: string, changes: Partial<Entry>) => {
    setEntries((prev) => ({
      ...prev,
      [categoryId]: (prev[categoryId] ?? []).map((e) =>
        e.key === key ? { ...e, ...changes } : e
      ),
    }));
  };

  const addFiles = async (categoryId: string, files: FileList | File[]) => {
    for (const file of Array.from(files)) {
      const key = `f${counter.current++}`;
      const check = validateFile(file.name, file.type, file.size);
      const base: Entry = {
        key,
        name: file.name,
        sizeLabel: formatSize(file.size),
        progress: 0,
        status: check.ok ? "uploading" : "error",
        error: check.ok ? undefined : check.reason,
      };
      setEntries((prev) => ({
        ...prev,
        [categoryId]: [...(prev[categoryId] ?? []), base],
      }));
      if (!check.ok) continue;

      const result = await uploadWithProgress(
        `/api/upload/${token}`,
        file,
        categoryId,
        (pct) => patch(categoryId, key, { progress: pct })
      );
      patch(
        categoryId,
        key,
        result.ok
          ? { status: "done", progress: 100 }
          : { status: "error", error: result.error }
      );
    }
  };

  const removeEntry = (categoryId: string, key: string) => {
    setEntries((prev) => ({
      ...prev,
      [categoryId]: (prev[categoryId] ?? []).filter((e) => e.key !== key),
    }));
  };

  const uploadedCount = Object.values(entries)
    .flat()
    .filter((e) => e.status === "done").length;
  const anyUploading = Object.values(entries)
    .flat()
    .some((e) => e.status === "uploading");

  const submitAll = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/upload/${token}`, { method: "PATCH" });
      const body = await res.json();
      if (res.ok) {
        setDone({ reference: body.reference, documentCount: body.documentCount });
      } else {
        setSubmitError(body.error ?? "Could not submit. Please try again.");
      }
    } catch {
      setSubmitError("Network error. Please try again.");
    }
    setSubmitting(false);
  };

  if (done) {
    return (
      <div className="mt-10 rounded-lg border border-gold/40 bg-champagne/40 px-6 py-10 text-center">
        <h2 className="font-display text-2xl text-ink">
          Documents Uploaded Successfully
        </h2>
        <div className="thread-divider mx-auto mt-4 w-24" />
        <p className="mt-6 text-sm text-ink">
          {done.documentCount} document{done.documentCount === 1 ? "" : "s"}{" "}
          received · Reference{" "}
          <span className="font-mono text-xs">{done.reference}</span>
        </p>
        <p className="mt-1 text-xs text-stone">
          {new Date().toLocaleString("en-MY")}
        </p>
        <p className="mt-6 text-sm text-stone">
          Thank you — Reena will review your documents and be in touch. You can
          close this page.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="space-y-5">
        {categories.map((cat) => (
          <section
            key={cat.id}
            className="rounded-lg border border-sand bg-white/60 px-5 py-5"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files.length) addFiles(cat.id, e.dataTransfer.files);
            }}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-medium text-ink">{cat.name}</h2>
              {cat.description && (
                <p className="text-xs text-stone">{cat.description}</p>
              )}
            </div>

            {(entries[cat.id] ?? []).length > 0 && (
              <ul className="mt-3 space-y-2">
                {(entries[cat.id] ?? []).map((e) => (
                  <li key={e.key} className="rounded-md border border-sand bg-white px-3 py-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-ink">
                        {e.status === "done" ? "✓ " : ""}
                        {e.name}{" "}
                        <span className="text-xs text-stone">({e.sizeLabel})</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => removeEntry(cat.id, e.key)}
                        className="text-xs text-stone hover:text-hibiscus-deep"
                      >
                        Remove
                      </button>
                    </div>
                    {e.status === "uploading" && (
                      <div className="mt-2 h-1.5 overflow-hidden rounded bg-sand">
                        <div
                          className="h-full bg-gold transition-all"
                          style={{ width: `${e.progress}%` }}
                        />
                      </div>
                    )}
                    {e.status === "error" && (
                      <p className="mt-1 text-xs text-hibiscus-deep">{e.error}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <label className="mt-3 block cursor-pointer rounded-md border border-dashed border-sand bg-paper px-4 py-4 text-center text-sm text-stone transition-colors hover:border-gold hover:text-ink">
              Drag files here, or tap to choose
              <input
                type="file"
                multiple
                accept={ACCEPT_ATTR}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) addFiles(cat.id, e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          </section>
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-stone">
        Accepted: PDF, JPG, PNG, HEIC, Word, Excel · up to {MAX_FILE_LABEL} per
        file
      </p>

      {submitError && (
        <p className="mt-4 rounded-md border border-hibiscus/30 bg-hibiscus/5 px-3.5 py-2.5 text-center text-sm text-hibiscus-deep">
          {submitError}
        </p>
      )}

      <button
        type="button"
        disabled={uploadedCount === 0 || anyUploading || submitting}
        onClick={submitAll}
        className="mt-6 w-full rounded-md bg-ink px-5 py-3 font-medium text-paper transition-colors hover:bg-ink-soft disabled:opacity-50"
      >
        {submitting
          ? "Submitting..."
          : anyUploading
            ? "Uploading..."
            : `Submit ${uploadedCount || ""} Document${uploadedCount === 1 ? "" : "s"}`}
      </button>
    </div>
  );
}
