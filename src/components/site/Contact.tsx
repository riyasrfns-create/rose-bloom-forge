import { useState, type FormEvent } from "react";
import { Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Reveal, SectionLabel } from "./ambient";

const field =
  "w-full rounded-sm border border-gold/20 bg-transparent px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none transition-colors";

export function Contact() {
  const [sending, setSending] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      (e.target as HTMLFormElement).reset();
      toast.success("Thank you — our export desk will reply within one business day.");
    }, 700);
  };

  return (
    <section id="contact" className="mx-auto max-w-7xl px-6 py-32">
      <div className="grid gap-16 lg:grid-cols-2">
        <Reveal>
          <SectionLabel>Enquiries</SectionLabel>
          <h2 className="mt-6 text-[clamp(2.2rem,5vw,3.6rem)] leading-tight">
            Request a <span className="italic gold-text">private quotation</span>
          </h2>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
            Share your destination, dates and volume. Our export desk replies in English within one
            business day, in your local currency.
          </p>

          <div className="mt-12 space-y-6">
            <a
              href="tel:+94776562526"
              className="flex items-start gap-4 text-sm transition-colors hover:text-gold"
            >
              <Phone size={18} className="mt-0.5 text-gold" strokeWidth={1.3} />
              <span>
                077 656 2526
                <span className="block text-xs text-muted-foreground">+94 77 656 2526</span>
              </span>
            </a>
            <p className="flex items-start gap-4 text-sm">
              <MapPin size={18} className="mt-0.5 text-gold" strokeWidth={1.3} />
              <span>
                159, 16 Megoda Kolonnawa Rd
                <span className="block text-xs text-muted-foreground">
                  Wellampitiya 12345, Sri Lanka
                </span>
              </span>
            </p>
            <p className="flex items-start gap-4 text-sm">
              <Clock size={18} className="mt-0.5 text-gold" strokeWidth={1.3} />
              <span>
                Monday – Saturday, 8:30 AM – 5:00 PM
                <span className="block text-xs text-muted-foreground">
                  Sri Lanka Standard Time (GMT+5:30)
                </span>
              </span>
            </p>
            <a
              href="https://wa.me/94776562526"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 rounded-sm border border-gold/45 px-7 py-3.5 text-[0.65rem] tracking-[0.3em] uppercase text-gold transition-colors hover:bg-gold/10"
            >
              <MessageCircle size={16} strokeWidth={1.4} /> WhatsApp us
            </a>
          </div>

          <div className="mt-10 overflow-hidden rounded-sm border border-gold/15">
            <iframe
              title="Flower Industries (Pvt) Ltd location in Wellampitiya"
              src="https://www.google.com/maps?q=159,16+Megoda+Kolonnawa+Rd,+Wellampitiya&output=embed"
              className="h-64 w-full grayscale-[0.5] contrast-125"
              loading="lazy"
            />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <form onSubmit={onSubmit} className="glass-panel space-y-5 rounded-sm p-8 md:p-10">
            <div className="grid gap-5 sm:grid-cols-2">
              <input required name="name" placeholder="Full name" className={field} />
              <input required type="email" name="email" placeholder="Email address" className={field} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <input required name="country" placeholder="Country / city" className={field} />
              <select name="type" className={field} defaultValue="">
                <option value="" disabled>
                  Enquiry type
                </option>
                <option>Hotel & hospitality contract</option>
                <option>Wedding or event</option>
                <option>Bulk export / wholesale</option>
                <option>Private gift order</option>
              </select>
            </div>
            <textarea
              required
              name="message"
              rows={6}
              placeholder="Tell us about your requirement, volume and dates"
              className={field}
            />
            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-sm py-4 text-[0.68rem] tracking-[0.32em] uppercase text-accent-foreground disabled:opacity-60"
              style={{ backgroundImage: "var(--gradient-gold)", boxShadow: "var(--shadow-lux)" }}
            >
              {sending ? "Sending…" : "Send enquiry"}
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}