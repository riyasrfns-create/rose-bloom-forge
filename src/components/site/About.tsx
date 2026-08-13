import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import atelier from "@/assets/atelier.jpg";
import { Reveal, SectionLabel } from "./ambient";

const stats = [
  ["18+", "Countries served"],
  ["5.0", "Client rating"],
  ["48h", "Door-to-door dispatch"],
];

export function About() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section id="about" ref={ref} className="mx-auto max-w-7xl px-6 py-32">
      <div className="grid items-center gap-16 lg:grid-cols-2">
        <motion.div style={{ y }} className="relative">
          <div
            aria-hidden
            className="absolute -inset-4 rounded-sm border border-gold/20"
            style={{ transform: "translate(18px, 18px)" }}
          />
          <img
            src={atelier}
            loading="lazy"
            width={1200}
            height={1500}
            alt="Florist arranging burgundy roses in the Flower Industries atelier"
            className="relative w-full rounded-sm object-cover"
          />
        </motion.div>

        <Reveal>
          <SectionLabel>The Maison</SectionLabel>
          <h2 className="mt-6 text-[clamp(2.2rem,5vw,3.6rem)] leading-tight">
            A Ceylon atelier for the <span className="italic gold-text">world's finest tables</span>
          </h2>
          <p className="mt-8 text-sm leading-relaxed text-muted-foreground md:text-base">
            From our Wellampitiya workshop, Flower Industries (Pvt) Ltd unites generations of Sri
            Lankan growing heritage with the discipline of European floral design. Every stem is
            hand-selected at dawn, conditioned in cold storage and composed by our senior florists.
          </p>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground md:text-base">
            We serve luxury hotels, embassies, event houses and private collectors — shipping under
            unbroken cold chain so a bloom cut in Colombo arrives immaculate in Dubai, London or
            Singapore.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-6 border-t border-gold/15 pt-8">
            {stats.map(([v, l]) => (
              <div key={l}>
                <p className="font-display text-4xl gold-text">{v}</p>
                <p className="mt-2 text-[0.6rem] tracking-[0.28em] uppercase text-muted-foreground">
                  {l}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}