import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { X } from "lucide-react";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";
import c2 from "@/assets/collection-2.jpg";
import c3 from "@/assets/collection-3.jpg";
import { Reveal, SectionLabel } from "./ambient";

const shots = [
  { src: g1, alt: "Macro of burgundy rose petals", span: "sm:row-span-2" },
  { src: g3, alt: "Candlelit banquet table with red roses", span: "sm:col-span-2" },
  { src: g2, alt: "Roses wrapped in black paper with gold ribbon", span: "" },
  { src: c3, alt: "Rose ceremony arch in a dark ballroom", span: "" },
  { src: g4, alt: "Roses packed in export crates", span: "sm:col-span-2" },
  { src: c2, alt: "Orchid and rose hotel lobby arrangement", span: "" },
];

export function Gallery() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section id="gallery" className="mx-auto max-w-7xl px-6 py-32">
      <Reveal>
        <SectionLabel>Gallery</SectionLabel>
        <h2 className="mt-6 text-[clamp(2.2rem,5vw,3.8rem)] leading-tight">
          The <span className="italic gold-text">portfolio</span>
        </h2>
      </Reveal>

      <div className="mt-16 grid auto-rows-[16rem] grid-cols-1 gap-4 sm:grid-cols-3">
        {shots.map((s, i) => (
          <Reveal key={i} delay={i * 0.06} className={s.span}>
            <button
              onClick={() => setOpen(s.src)}
              className="group h-full w-full overflow-hidden rounded-sm border border-gold/10"
            >
              <img
                src={s.src}
                alt={s.alt}
                loading="lazy"
                className="size-full object-cover transition-transform duration-[1.4s] group-hover:scale-115"
              />
            </button>
          </Reveal>
        ))}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-background/95 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
          >
            <button
              aria-label="Close"
              className="absolute top-8 right-8 text-gold"
              onClick={() => setOpen(null)}
            >
              <X />
            </button>
            <motion.img
              src={open}
              alt="Enlarged floral arrangement"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="max-h-[85vh] rounded-sm border border-gold/25 object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}