import { motion } from "motion/react";
import { Plane, Snowflake, ShieldCheck, Globe2 } from "lucide-react";
import { Reveal, SectionLabel } from "./ambient";

const pins = [
  { x: 47, y: 34, label: "London" },
  { x: 58, y: 46, label: "Dubai" },
  { x: 64, y: 55, label: "Colombo" },
  { x: 73, y: 60, label: "Singapore" },
  { x: 82, y: 72, label: "Sydney" },
  { x: 22, y: 42, label: "New York" },
  { x: 79, y: 33, label: "Tokyo" },
];

const services = [
  { icon: Snowflake, title: "Unbroken cold chain", copy: "4–6°C conditioning from harvest to hold." },
  { icon: Plane, title: "Daily air freight", copy: "Direct cargo from BIA Colombo, six days a week." },
  { icon: ShieldCheck, title: "Phytosanitary certified", copy: "Full export documentation handled in-house." },
  { icon: Globe2, title: "Bulk & corporate", copy: "Standing weekly contracts for hotels and retailers." },
];

export function Export() {
  return (
    <section id="export" className="mx-auto max-w-7xl px-6 py-32">
      <Reveal>
        <SectionLabel>International Clients</SectionLabel>
        <h2 className="mt-6 max-w-3xl text-[clamp(2.2rem,5vw,3.8rem)] leading-tight">
          Flown fresh to <span className="italic gold-text">five continents</span>
        </h2>
      </Reveal>

      <div className="mt-16 grid gap-14 lg:grid-cols-[1.2fr_1fr]">
        <Reveal className="glass-panel relative aspect-[16/9] overflow-hidden rounded-sm">
          <svg viewBox="0 0 100 60" className="absolute inset-0 size-full opacity-25">
            {Array.from({ length: 30 }, (_, r) =>
              Array.from({ length: 50 }, (_, c) => (
                <circle key={`${r}-${c}`} cx={c * 2 + 1} cy={r * 2 + 1} r="0.28" fill="var(--gold)" />
              )),
            )}
          </svg>
          {pins.map((p, i) => (
            <motion.div
              key={p.label}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6 }}
            >
              <span
                className="block size-2 rounded-full bg-gold"
                style={{ boxShadow: "0 0 0 4px oklch(0.82 0.11 88 / 0.18), 0 0 16px var(--gold)" }}
              />
              <span className="mt-2 block whitespace-nowrap text-[0.5rem] tracking-[0.28em] uppercase text-gold/80">
                {p.label}
              </span>
            </motion.div>
          ))}
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <div className="h-full rounded-sm border border-gold/15 p-7 transition-colors hover:border-gold/40">
                <s.icon className="text-gold" size={22} strokeWidth={1.2} />
                <h3 className="mt-5 text-xl">{s.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{s.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}