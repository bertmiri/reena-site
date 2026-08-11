"use client";

import { useActionState, useState } from "react";
import {
  createUploadRequest,
  type CreateUploadRequestState,
} from "./upload-request-actions";

type Category = { id: string; name: string };

const EMPTY_STATE: CreateUploadRequestState = {};

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          window.prompt("Copy manually:", text);
        }
      }}
      className="rounded-md border border-sand px-3 py-1.5 text-sm text-ink transition-colors hover:border-gold"
    >
      {copied ? "Copied ✓" : label}
    </button>
  );
}

export function CreateUploadRequestForm({
  clientId,
  clientName,
  categories,
}: {
  clientId: string;
  clientName: string;
  categories: Category[];
}) {
  const [state, formAction, pending] = useActionState(createUploadRequest, EMPTY_STATE);

  if (state.link) {
    const expiry = state.expiresAt
      ? new Date(state.expiresAt).toLocaleDateString("en-MY")
      : "";
    const whatsappText = `Hi ${clientName}, please upload your documents securely here: ${state.link} (link expires ${expiry}). Thank you! — Reena Mazlan, RM Property Hub`;
    return (
      <div className="rounded-md border border-gold/40 bg-champagne/40 px-4 py-4">
        <p className="text-sm font-medium text-ink">Upload link created.</p>
        <p className="mt-1 text-xs text-stone">
          This link is shown only once — copy it now. If it is lost, revoke it
          and create a new one.
        </p>
        <input
          readOnly
          value={state.link}
          onFocus={(e) => e.target.select()}
          className="mt-3 w-full rounded-md border border-sand bg-white px-3 py-2 font-mono text-xs text-ink"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyButton text={state.link} label="Copy Link" />
          <CopyButton text={whatsappText} label="Copy WhatsApp Message" />
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="client_id" value={clientId} />

      <div>
        <p className="mb-1.5 text-sm font-medium text-ink">Documents needed</p>
        <div className="space-y-1.5">
          {categories.map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                name="category_ids"
                value={c.id}
                defaultChecked
                className="accent-[#8c7030]"
              />
              {c.name}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="expiry_days" className="mb-1.5 block text-sm font-medium text-ink">
            Link expires in
          </label>
          <select
            id="expiry_days"
            name="expiry_days"
            defaultValue="7"
            className="rounded-md border border-sand bg-white px-3 py-2 text-sm text-ink"
          >
            <option value="1">1 day</option>
            <option value="3">3 days</option>
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
          </select>
        </div>
        <div className="min-w-56 flex-1">
          <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-ink">
            Message (optional)
          </label>
          <input
            id="message"
            name="message"
            maxLength={500}
            placeholder="Shown to the client on the upload page"
            className="w-full rounded-md border border-sand bg-white px-3 py-2 text-sm text-ink placeholder:text-stone/60"
          />
        </div>
      </div>

      {state.error && (
        <p className="rounded-md border border-hibiscus/30 bg-hibiscus/5 px-3.5 py-2.5 text-sm text-hibiscus-deep">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-ink-soft disabled:opacity-50"
      >
        {pending ? "Creating..." : "Create Upload Link"}
      </button>
    </form>
  );
}
