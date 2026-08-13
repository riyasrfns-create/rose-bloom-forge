import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Star } from "lucide-react";
import { SectionLabel } from "./ambient";

const quotes = [
  {
    text: "Every weekly delivery arrives as though it were cut moments earlier. Our lobby has never looked more considered.",
    name: "Director of Rooms",
    place: "Five-star resort, Maldives",
  },
  {
    text: "They handled a 400-guest wedding installation from Colombo to Dubai without a single stem out of place.",
    name: "Event Producer",
    place: "Dubai, UAE",
  },
  {
    text: "Exceptional quality and impeccable communication across time zones. Our benchmark supplier in South Asia.",
    name: "Floral Buyer",
    place: "London, United Kingdom",
  },
];

export function Testimonials() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % quotes.length), 6500);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative overflow-hidden py-32">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <div className="flex justify-center">
          <SectionLabel>Client Voices</SectionLabel>
        </div>
        <div className="mt-10 flex justify-center gap-1.5">
          {Array.from({ length: 5 }, (_, s) => (
            <Star key={s} size={15} className="fill-gold text-gold" />
          ))}
        </div>

        <div className="relative mt-10 min-h-56">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7 }}
            >
              <p className="font-display text-[clamp(1.4rem,3.2vw,2.4rem)] leading-snug italic">
                “{quotes[i].text}”
              </p>
              <footer className="mt-8">
                <p className="text-[0.65rem] tracking-[0.35em] uppercase text-gold">
                  {quotes[i].name}
                </p>
                <p className="mt-2 text-[0.6rem] tracking-[0.28em] uppercase text-muted-foreground">
                  {quotes[i].place}
                </p>
              </footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex justify-center gap-3">
          {quotes.map((_, d) => (
            <button
              key={d}
              aria-label={`Show testimonial ${d + 1}`}
              onClick={() => setI(d)}
              className={`h-px w-10 transition-colors ${d === i ? "bg-gold" : "bg-gold/25"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}