import Link from "next/link";
import { whatsappLink, type SiteSettings } from "@/lib/site-settings";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="mt-20 bg-ink text-paper">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div>
            <p className="font-display text-2xl">RM Property Hub</p>
            <p className="mt-1 text-[10px] tracking-[0.25em] text-gold">FIND · INVEST · GROW</p>
            <p className="mt-4 text-sm text-paper/80">
              {settings.agent_name} · {settings.agent_title}
            </p>
            <p className="text-xs text-paper/80">{settings.ren}</p>
          </div>
          <div className="text-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gold">Contact</p>
            <p className="mt-3"><a href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`} className="text-paper/80 transition-colors hover:text-paper">{settings.phone}</a></p>
            <p className="mt-1"><a href={whatsappLink(settings)} target="_blank" rel="noopener" className="text-paper/80 transition-colors hover:text-paper">WhatsApp Me</a></p>
            <p className="mt-1"><a href={`mailto:${settings.email}`} className="text-paper/80 transition-colors hover:text-paper">{settings.email}</a></p>
          </div>
          <div className="text-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gold">Follow</p>
            <p className="mt-3"><a href={settings.facebook} target="_blank" rel="noopener" className="text-paper/80 transition-colors hover:text-paper">Facebook</a></p>
            <p className="mt-1"><a href={settings.instagram} target="_blank" rel="noopener" className="text-paper/80 transition-colors hover:text-paper">Instagram</a></p>
          </div>
        </div>
        <div className="thread-divider mt-10 opacity-40" />
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-paper/80">
          <p>© {new Date().getFullYear()} {settings.agent_name} · RM Property Hub</p>
          <p><Link href="/upload-documents" className="transition-colors hover:text-paper">Secure Document Upload</Link></p>
        </div>
      </div>
    </footer>
  );
}
