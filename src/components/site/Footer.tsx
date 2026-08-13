import { useState, type FormEvent } from "react";
import { toast } from "sonner";

export function Footer() {
  const [email, setEmail] = useState("");

  const join = (e: FormEvent) => {
    e.preventDefault();
    setEmail("");
    toast.success("Welcome to our exclusive floral circle.");
  };

  return (
    <footer className="border-t border-gold/15 py-16">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 md:grid-cols-3">
        <div>
          <span className="block font-display text-3xl tracking-[0.18em] gold-text">FLOWER</span>
          <span className="block text-[0.55rem] tracking-[0.55em] uppercase text-muted-foreground">
            Industries (Pvt) Ltd
          </span>
          <p className="mt-6 max-w-xs text-sm text-muted-foreground">
            Couture floral design and export from Wellampitiya, Sri Lanka.
          </p>
        </div>

        <div className="text-sm text-muted-foreground">
          <p className="text-[0.6rem] tracking-[0.35em] uppercase text-gold">Atelier</p>
          <p className="mt-5">159, 16 Megoda Kolonnawa Rd</p>
          <p>Wellampitiya 12345, Sri Lanka</p>
          <a href="tel:+94776562526" className="mt-3 block hover:text-gold">
            077 656 2526
          </a>
          <p className="mt-3">Mon – Sat · 8:30 AM – 5:00 PM</p>
        </div>

        <div>
          <p className="text-[0.6rem] tracking-[0.35em] uppercase text-gold">
            Join our exclusive floral circle
          </p>
          <form onSubmit={join} className="mt-5 flex gap-3">
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="w-full rounded-sm border border-gold/20 bg-transparent px-4 py-3 text-sm focus:border-gold focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-sm border border-gold/50 px-5 text-[0.6rem] tracking-[0.25em] uppercase text-gold transition-colors hover:bg-gold hover:text-accent-foreground"
            >
              Join
            </button>
          </form>
          <div className="gold-rule mt-10 w-full" />
          <p className="mt-6 text-[0.6rem] tracking-[0.22em] uppercase text-muted-foreground">
            © {new Date().getFullYear()} Flower Industries (Pvt) Ltd
          </p>
        </div>
      </div>
    </footer>
  );
}