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
    <header className="border-b border-sand bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/" className="leading-tight">
          <span className="font-display text-xl text-ink">RM Property Hub</span>
          <span className="block text-[10px] tracking-[0.2em] text-gold-deep">FIND · INVEST · GROW</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-stone transition-colors hover:text-ink">{item.label}</Link>
          ))}
          <a href={whatsappLink(settings)} target="_blank" rel="noopener" className="rounded-md bg-ink px-3.5 py-2 text-sm font-medium text-paper transition-colors hover:bg-ink-soft">Contact Me</a>
        </nav>
      </div>
    </header>
  );
}
