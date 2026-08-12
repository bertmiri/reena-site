"use client";

import { deleteDocument } from "./document-actions";

export function DeleteDocumentButton({
  documentId,
  clientId,
  filename,
}: {
  documentId: string;
  clientId: string;
  filename: string;
}) {
  return (
    <form
      action={deleteDocument}
      onSubmit={(e) => {
        if (
          !window.confirm(
            `Permanently delete "${filename}"? This cannot be undone.`
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="document_id" value={documentId} />
      <input type="hidden" name="client_id" value={clientId} />
      <button
        type="submit"
        className="text-xs text-stone transition-colors hover:text-hibiscus-deep"
      >
        Delete
      </button>
    </form>
  );
}
