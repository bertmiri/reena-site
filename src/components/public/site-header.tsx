import Link from "next/link";
import { whatsappLink, type SiteSettings } from "@/lib/site-settings";
import { MobileNav, type MobileNavLink } from "@/components/mobile-nav";

const NAV: MobileNavLink[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/loan-calculator", label: "Loan Calculator" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ settings }: { settings: SiteSettings }) {
  return (
    <header className="border-b border-gold/20 bg-night">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/" className="leading-tight">
          <span className="font-display text-xl tracking-wide text-gold-bright">RM PROPERTY HUB</span>
          <span className="block text-[9px] tracking-[0.35em] text-paper/50">FIND · INVEST · GROW</span>
        </Link>

        <nav className="hidden items-center gap-x-5 text-sm md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-paper/70 transition-colors hover:text-gold-bright">{item.label}</Link>
          ))}
          <a href={whatsappLink(settings)} target="_blank" rel="noopener" className="rounded-md bg-gold px-3.5 py-2 text-sm font-medium text-night transition-colors hover:bg-gold-bright">Contact Me</a>
        </nav>

        <div className="md:hidden">
          <MobileNav
            links={NAV}
            variant="public"
            footer={
              <a href={whatsappLink(settings)} target="_blank" rel="noopener" className="block rounded-md bg-gold px-4 py-3 text-center font-medium text-night">Contact Me on WhatsApp</a>
            }
          />
        </div>
      </div>
    </header>
  );
}
