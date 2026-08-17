"use client";

import { useState } from "react";

type Photo = { id: string; url: string };

export function PhotoManager({
  listingId,
  initialPhotos,
}: {
  listingId: string;
  initialPhotos: Photo[];
}) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFiles = async (files: FileList | File[]) => {
    setError(null);
    for (const file of Array.from(files)) {
      setBusy(true);
      try {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch(`/api/admin/listings/${listingId}/photos`, {
          method: "POST",
          body: form,
        });
        const body = await res.json();
        if (res.ok) {
          setPhotos((prev) => [...prev, { id: body.id, url: body.url }]);
        } else {
          setError(body.error ?? "Upload failed.");
        }
      } catch {
        setError("Network error. Please try again.");
      }
    }
    setBusy(false);
  };

  const removePhoto = async (photoId: string) => {
    if (!window.confirm("Remove this photo?")) return;
    const res = await fetch(
      `/api/admin/listings/${listingId}/photos?photo=${photoId}`,
      { method: "DELETE" }
    );
    if (res.ok) {
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } else {
      setError("Could not remove photo.");
    }
  };

  return (
    <div>
      <p className="mb-1.5 block text-sm font-medium text-ink">Photos</p>
      <p className="mb-3 text-xs text-stone">
        Use your own photos or ones you have permission to use. First photo is
        the cover. JPG, PNG, WEBP or HEIC, up to 10 MB each.
      </p>

      {photos.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {photos.map((p, i) => (
            <div key={p.id} className="relative overflow-hidden rounded-md border border-sand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" className="aspect-square w-full object-cover" />
              {i === 0 && (
                <span className="absolute left-1 top-1 rounded bg-ink/80 px-1.5 py-0.5 text-[10px] text-paper">Cover</span>
              )}
              <button
                type="button"
                onClick={() => removePhoto(p.id)}
                className="absolute right-1 top-1 rounded bg-hibiscus-deep/90 px-1.5 py-0.5 text-[10px] text-paper"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <label
        className="block cursor-pointer rounded-md border border-dashed border-sand bg-paper px-4 py-6 text-center text-sm text-stone transition-colors hover:border-gold hover:text-ink"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
        }}
      >
        {busy ? "Uploading…" : "Drag photos here, or tap to choose"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {error && <p className="mt-2 text-xs text-hibiscus-deep">{error}</p>}
    </div>
  );
}
