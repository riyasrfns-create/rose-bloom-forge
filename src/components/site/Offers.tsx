import { useEffect, useState } from "react";
import { Reveal, SectionLabel, GoldSparkles } from "./ambient";

const offers = [
  {
    badge: "Save 20%",
    title: "International Debut Offer",
    copy: "20% off your first international order above USD 500, including cold-chain packing.",
    terms: "New overseas clients · Until stock lasts",
  },
  {
    badge: "Free Freight",
    title: "Complimentary Air Freight",
    copy: "Free airway freight to the UAE, Singapore, Maldives and India on bulk weekly contracts.",
    terms: "Minimum 4-week standing order",
  },
  {
    badge: "Gift Suite",
    title: "Wedding & Hospitality Suite",
    copy: "Book a full event package and receive a complimentary lobby installation every month.",
    terms: "Hotels, resorts & wedding planners",
  },
];

function useCountdown(target: number) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  if (left === null) return null;
  const s = Math.floor(left / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

export function Offers() {
  const [target] = useState(() => Date.now() + 1000 * 60 * 60 * 24 * 21);
  const c = useCountdown(target);

  return (
    <section id="offers" className="relative overflow-hidden py-32">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "var(--gradient-rose)", opacity: 0.35 }}
      />
      <GoldSparkles count={14} />
      <div className="relative mx-auto max-w-7xl px-6">
        <Reveal className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <SectionLabel>Exclusive Offers</SectionLabel>
            <h2 className="mt-6 text-[clamp(2.2rem,5vw,3.8rem)] leading-tight">
              Privileges for our <span className="italic gold-text">international clientele</span>
            </h2>
          </div>

          <div className="glass-panel rounded-sm px-7 py-5">
            <p className="text-[0.58rem] tracking-[0.4em] uppercase text-gold">Season closes in</p>
            <div className="mt-3 flex gap-5">
              {[
                ["Days", c?.days],
                ["Hrs", c?.hours],
                ["Min", c?.minutes],
                ["Sec", c?.seconds],
              ].map(([label, v]) => (
                <div key={label as string} className="text-center">
                  <p className="font-display text-3xl gold-text tabular-nums">
                    {v === undefined || v === null ? "--" : String(v).padStart(2, "0")}
                  </p>
                  <p className="text-[0.5rem] tracking-[0.3em] uppercase text-muted-foreground">
                    {label as string}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {offers.map((o, i) => (
            <Reveal key={o.title} delay={i * 0.1}>
              <div className="glass-panel group relative h-full rounded-sm p-9 transition-transform duration-500 hover:-translate-y-2">
                <span
                  className="absolute -top-px right-7 rounded-b-sm px-4 py-2 text-[0.55rem] tracking-[0.3em] uppercase text-accent-foreground"
                  style={{ backgroundImage: "var(--gradient-gold)" }}
                >
                  {o.badge}
                </span>
                <h3 className="mt-8 text-2xl">{o.title}</h3>
                <div className="gold-rule my-5 w-full" />
                <p className="text-sm leading-relaxed text-muted-foreground">{o.copy}</p>
                <p className="mt-6 text-[0.6rem] tracking-[0.28em] uppercase text-gold/80">
                  {o.terms}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}