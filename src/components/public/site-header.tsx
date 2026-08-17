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

export function SiteHeader({
  settings,
  showListings = false,
}: {
  settings: SiteSettings;
  showListings?: boolean;
}) {
  const nav: MobileNavLink[] = showListings
    ? [NAV[0], { href: "/listings", label: "Properties" }, ...NAV.slice(1)]
    : NAV;

  return (
    <header className="border-b border-gold/20 bg-night">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/" className="leading-tight">
          <span className="font-display text-xl tracking-wide text-gold-bright">RM PROPERTY HUB</span>
          <span className="block text-[9px] tracking-[0.35em] text-paper/75">FIND · INVEST · GROW</span>
        </Link>

        <nav className="hidden items-center gap-x-5 text-sm md:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-paper/80 transition-colors hover:text-gold-bright">{item.label}</Link>
          ))}
          <a href={whatsappLink(settings)} target="_blank" rel="noopener" className="rounded-md bg-gold px-3.5 py-2 text-sm font-semibold text-night transition-colors hover:bg-gold-bright">Contact Me</a>
        </nav>

        <div className="md:hidden">
          <MobileNav
            links={nav}
            variant="public"
            footer={
              <div>
                <a href={whatsappLink(settings)} target="_blank" rel="noopener" className="block rounded-md bg-gold px-4 py-3 text-center font-semibold text-night">Contact Me on WhatsApp</a>
                <Link href="/admin" className="mt-4 block text-center text-xs tracking-[0.2em] text-paper/50 hover:text-gold-bright">AGENT PORTAL</Link>
              </div>
            }
          />
        </div>
      </div>
    </header>
  );
}
