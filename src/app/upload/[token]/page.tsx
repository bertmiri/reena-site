import type { Metadata } from "next";
import { validateUploadToken } from "@/lib/upload-requests";
import { Uploader } from "./uploader";

export const metadata: Metadata = {
  title: "Secure Document Upload | RM Property Hub",
  robots: { index: false, follow: false },
};

export default async function UploadPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const valid = await validateUploadToken(token);

  if (!valid) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-paper px-6">
        <div className="w-full max-w-md text-center">
          <p className="font-display text-2xl text-ink">RM Property Hub</p>
          <div className="thread-divider mx-auto mt-5 w-24" />
          <h1 className="mt-8 font-display text-xl text-ink">
            This upload link is no longer available
          </h1>
          <p className="mt-3 text-sm text-stone">
            The link may have expired or been replaced. Please contact Reena
            Mazlan for a new secure upload link.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-paper px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-2xl">
        <header className="text-center">
          <p className="font-display text-2xl text-ink">RM Property Hub</p>
          <p className="mt-1 text-xs tracking-wide text-stone">
            Find · Invest · Grow
          </p>
          <div className="thread-divider mx-auto mt-5 w-24" />
          <h1 className="mt-8 font-display text-2xl text-ink">
            Secure Document Upload
          </h1>
          <p className="mt-2 text-sm text-stone">
            Uploading as{" "}
            <span className="font-medium text-ink">{valid.clientName}</span> ·{" "}
            <span className="font-mono text-xs">{valid.reference}</span>
          </p>
          <p className="mt-1 text-xs text-stone">
            Link valid until{" "}
            {new Date(valid.expiresAt).toLocaleDateString("en-MY")}
          </p>
        </header>

        {valid.message && (
          <div className="mt-8 rounded-md border border-gold/40 bg-champagne/40 px-4 py-3 text-sm text-ink">
            <p className="text-xs font-medium uppercase tracking-wide text-gold-deep">
              Message from Reena
            </p>
            <p className="mt-1">{valid.message}</p>
          </div>
        )}

        <Uploader
          token={token}
          categories={valid.categories.map((c) => ({
            id: c.id,
            name: c.name,
            description: c.description,
          }))}
        />

        <p className="mt-10 text-center text-xs text-stone">
          Your documents are transferred securely and stored privately. Only
          Reena Mazlan can access them.
        </p>
      </div>
    </main>
  );
}
