import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/shop", label: "Shop", route: true },
  { href: "#collections", label: "Collections" },
  { href: "#offers", label: "Offers" },
  { href: "#export", label: "Global Export" },
  { href: "#gallery", label: "Gallery" },
  { href: "#contact", label: "Contact" },
];

export function Nav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        solid ? "bg-background/85 backdrop-blur-xl border-b border-gold/15 py-3" : "py-6"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6">
        <a href="#top" className="leading-none">
          <span className="block font-display text-2xl tracking-[0.18em] gold-text">FLOWER</span>
          <span className="block text-[0.55rem] tracking-[0.55em] uppercase text-muted-foreground">
            Industries
          </span>
        </a>

        <ul className="hidden items-center gap-10 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              {l.route ? (
                <Link
                  to="/shop"
                  className="relative text-[0.7rem] tracking-[0.28em] uppercase text-foreground/75 transition-colors hover:text-gold"
                >
                  {l.label}
                </Link>
              ) : (
              <a
                href={l.href}
                className="relative text-[0.7rem] tracking-[0.28em] uppercase text-foreground/75 transition-colors hover:text-gold"
              >
                {l.label}
              </a>
              )}
            </li>
          ))}
        </ul>

        <a
          href="#contact"
          className="hidden rounded-sm border border-gold/50 px-6 py-3 text-[0.65rem] tracking-[0.3em] uppercase text-gold transition-all hover:bg-gold hover:text-accent-foreground md:inline-block"
        >
          Request a Quote
        </a>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="text-gold md:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <ul className="mt-4 space-y-4 border-t border-gold/15 bg-background/95 px-6 py-6 md:hidden">
          {links.map((l) => (
            <li key={l.href}>
              {l.route ? (
                <Link
                  to="/shop"
                  onClick={() => setOpen(false)}
                  className="block text-sm tracking-[0.25em] uppercase text-foreground/80"
                >
                  {l.label}
                </Link>
              ) : (
              <a
                href={l.href}
                onClick={() => setOpen(false)}
                className="block text-sm tracking-[0.25em] uppercase text-foreground/80"
              >
                {l.label}
              </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}