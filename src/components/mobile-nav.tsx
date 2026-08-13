"use client";

import { useState } from "react";
import Link from "next/link";

export type MobileNavLink = { href: string; label: string };

export function MobileNav({
  links,
  variant = "public",
  footer,
}: {
  links: MobileNavLink[];
  variant?: "public" | "portal";
  footer?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const dark = variant === "public";
  const barText = dark ? "text-paper" : "text-ink";
  const panelBg = dark ? "bg-night text-paper" : "bg-paper text-ink";
  const linkColor = dark ? "text-paper/80" : "text-ink";

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={`inline-flex flex-col justify-center gap-1.5 p-2 ${barText}`}
      >
        <span className="block h-0.5 w-6 bg-current" />
        <span className="block h-0.5 w-6 bg-current" />
        <span className="block h-0.5 w-6 bg-current" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className={`absolute right-0 top-0 flex h-full w-72 max-w-[80%] flex-col ${panelBg} px-6 py-6 shadow-xl`}>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className={`self-end text-2xl leading-none ${linkColor}`}
            >
              ×
            </button>
            <nav className="mt-6 flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-md px-3 py-3 text-base ${linkColor} hover:opacity-70`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            {footer && <div className="mt-auto pt-6">{footer}</div>}
          </div>
        </div>
      )}
    </>
  );
}
