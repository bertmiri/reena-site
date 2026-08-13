import Link from "next/link";
import { whatsappLink, type SiteSettings } from "@/lib/site-settings";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/loan-calculator", label: "Loan Calculator" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ settings }: { settings: SiteSettings }) {
  return (
    <header className="border-b border-gold/20 bg-night">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/" className="leading-tight">
          <span className="font-display text-xl tracking-wide text-gold-bright">RM PROPERTY HUB</span>
          <span className="block text-[9px] tracking-[0.35em] text-paper/50">FIND · INVEST · GROW</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-paper/70 transition-colors hover:text-gold-bright">{item.label}</Link>
          ))}
          <a href={whatsappLink(settings)} target="_blank" rel="noopener" className="rounded-md bg-gold px-3.5 py-2 text-sm font-medium text-night transition-colors hover:bg-gold-bright">Contact Me</a>
        </nav>
      </div>
    </header>
  );
}
