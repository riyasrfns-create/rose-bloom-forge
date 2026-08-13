import { motion, useScroll, useTransform } from "motion/react";
import heroRose from "@/assets/hero-rose.jpg";
import { GoldSparkles } from "./ambient";

export function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 700], [0, 160]);
  const rotate = useTransform(scrollY, [0, 900], [0, 55]);
  const scale = useTransform(scrollY, [0, 900], [1, 1.18]);
  const fade = useTransform(scrollY, [0, 520], [1, 0]);

  return (
    <section id="top" className="relative flex min-h-screen items-center overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 68% 45%, color-mix(in oklab, var(--rose-deep) 55%, transparent), transparent 60%)",
        }}
      />
      <GoldSparkles count={16} />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-16 px-6 pt-32 pb-24 lg:grid-cols-[1.05fr_1fr]">
        <motion.div style={{ opacity: fade }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7, duration: 1 }}
            className="flex items-center gap-4"
          >
            <span className="h-px w-12 bg-gold/60" />
            <span className="text-[0.62rem] tracking-[0.5em] uppercase text-gold">
              Est. Sri Lanka · Delivered Worldwide
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 text-[clamp(3rem,8vw,6.5rem)] leading-[0.95] tracking-tight"
          >
            Timeless Elegance,
            <span className="block italic gold-text">Delivered Worldwide</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.95, duration: 1 }}
            className="mt-8 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base"
          >
            Flower Industries (Pvt) Ltd crafts couture floral artistry from the highlands of Sri
            Lanka for luxury hotels, private clients and international ateliers across five
            continents.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.05, duration: 1 }}
            className="mt-12 flex flex-wrap gap-4"
          >
            <a
              href="#collections"
              className="group relative overflow-hidden rounded-sm px-9 py-4 text-[0.68rem] tracking-[0.3em] uppercase text-accent-foreground"
              style={{ backgroundImage: "var(--gradient-gold)", boxShadow: "var(--shadow-lux)" }}
            >
              Explore Collections
            </a>
            <a
              href="#contact"
              className="rounded-sm border border-gold/45 px-9 py-4 text-[0.68rem] tracking-[0.3em] uppercase text-gold transition-colors hover:bg-gold/10"
            >
              Request a Quote
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          style={{ y, perspective: 1200 }}
          className="relative mx-auto aspect-square w-full max-w-xl"
        >
          <motion.div
            style={{ rotate, scale }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.6, duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative size-full"
          >
            <div
              aria-hidden
              className="absolute inset-6 rounded-full blur-3xl"
              style={{ background: "var(--gradient-rose)", opacity: 0.75 }}
            />
            <motion.img
              src={heroRose}
              width={1408}
              height={1408}
              alt="Single dew-covered crimson rose by Flower Industries"
              className="relative size-full rounded-full object-cover"
              style={{
                maskImage: "radial-gradient(circle at 50% 48%, black 55%, transparent 72%)",
                WebkitMaskImage: "radial-gradient(circle at 50% 48%, black 55%, transparent 72%)",
              }}
              animate={{ rotateZ: [0, 3, 0, -3, 0] }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            />
            <span
              aria-hidden
              className="absolute inset-10 rounded-full border border-gold/25"
              style={{ animation: "spin-y 14s linear infinite" }}
            />
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute inset-x-0 bottom-8 flex justify-center">
        <span className="text-[0.55rem] tracking-[0.45em] uppercase text-muted-foreground">
          Scroll
        </span>
      </div>
    </section>
  );
}