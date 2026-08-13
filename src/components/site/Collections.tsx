import { useState } from "react";
import { Reveal, SectionLabel } from "./ambient";
import c1 from "@/assets/collection-1.jpg";
import c2 from "@/assets/collection-2.jpg";
import c3 from "@/assets/collection-3.jpg";
import c4 from "@/assets/collection-4.jpg";

const items = [
  {
    img: c1,
    name: "Noir Velvet Roses",
    note: "Signature Bouquets",
    copy: "Grade-A burgundy roses, hand-tied in black couture wrap with gold silk.",
  },
  {
    img: c2,
    name: "Maison Orchidée",
    note: "Hospitality Florals",
    copy: "Lobby and suite installations for five-star hotels and private residences.",
  },
  {
    img: c3,
    name: "Cérémonie Rouge",
    note: "Weddings & Events",
    copy: "Full-scale arches, aisles and tablescapes designed and flown to venue.",
  },
  {
    img: c4,
    name: "Ceylon Exotica",
    note: "Export Gift Boxes",
    copy: "Rare tropical blooms of Sri Lanka, cold-chain packed for global delivery.",
  },
];

function TiltCard({ item, index }: { item: (typeof items)[number]; index: number }) {
  const [t, setT] = useState({ x: 0, y: 0 });

  return (
    <Reveal delay={index * 0.08}>
      <article
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setT({
            x: ((e.clientY - r.top) / r.height - 0.5) * -10,
            y: ((e.clientX - r.left) / r.width - 0.5) * 10,
          });
        }}
        onMouseLeave={() => setT({ x: 0, y: 0 })}
        className="group relative overflow-hidden rounded-sm border border-gold/15 transition-shadow duration-500 hover:shadow-[var(--shadow-lux)]"
        style={{
          transform: `perspective(900px) rotateX(${t.x}deg) rotateY(${t.y}deg)`,
          transition: "transform 300ms ease-out",
        }}
      >
        <img
          src={item.img}
          loading="lazy"
          width={900}
          height={1100}
          alt={item.name}
          className="h-[26rem] w-full object-cover transition-transform duration-[1.2s] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-7">
          <p className="text-[0.6rem] tracking-[0.4em] uppercase text-gold">{item.note}</p>
          <h3 className="mt-3 text-2xl">{item.name}</h3>
          <p className="mt-3 max-h-0 overflow-hidden text-sm text-muted-foreground opacity-0 transition-all duration-500 group-hover:max-h-24 group-hover:opacity-100">
            {item.copy}
          </p>
        </div>
      </article>
    </Reveal>
  );
}

export function Collections() {
  return (
    <section id="collections" className="relative mx-auto max-w-7xl px-6 py-32">
      <Reveal>
        <SectionLabel>Signature Collections</SectionLabel>
        <h2 className="mt-6 max-w-2xl text-[clamp(2.2rem,5vw,3.8rem)] leading-tight">
          Arrangements composed like <span className="italic gold-text">couture</span>
        </h2>
      </Reveal>

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <TiltCard key={item.name} item={item} index={i} />
        ))}
      </div>
    </section>
  );
}