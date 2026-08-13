import { useEffect, useState } from "react";
import { motion } from "motion/react";

type Petal = { left: number; delay: number; duration: number; size: number; opacity: number };

export function PetalField({ count = 14 }: { count?: number }) {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    setPetals(
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 18,
        duration: 18 + Math.random() * 22,
        size: 8 + Math.random() * 14,
        opacity: 0.15 + Math.random() * 0.35,
      })),
    );
  }, [count]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {petals.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 block"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.7,
            opacity: p.opacity,
            borderRadius: "60% 20% 60% 20%",
            background: "var(--gradient-rose)",
            boxShadow: "0 0 12px oklch(0.52 0.19 12 / 0.5)",
            animation: `petal-drift ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export function GoldSparkles({ count = 10 }: { count?: number }) {
  const [dots, setDots] = useState<{ x: number; y: number; d: number }[]>([]);
  useEffect(() => {
    setDots(
      Array.from({ length: count }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        d: 1.5 + Math.random() * 3,
      })),
    );
  }, [count]);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute size-[3px] rounded-full bg-gold"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            animation: `shimmer ${d.d}s ease-in-out infinite`,
            boxShadow: "0 0 8px var(--gold)",
          }}
        />
      ))}
    </div>
  );
}

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <span className="h-px w-10 bg-gold/60" />
      <span className="text-[0.68rem] tracking-[0.42em] uppercase text-gold">{children}</span>
    </div>
  );
}