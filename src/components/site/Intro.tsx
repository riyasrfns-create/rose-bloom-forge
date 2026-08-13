import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

export function Intro() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDone(true), 2100);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <div className="relative flex flex-col items-center">
            <div className="relative size-32" style={{ perspective: "600px" }}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <motion.span
                  key={i}
                  className="absolute inset-0 m-auto block size-16 rounded-full"
                  style={{
                    background: "var(--gradient-rose)",
                    borderRadius: "70% 20% 70% 20%",
                    border: "1px solid color-mix(in oklab, var(--gold) 35%, transparent)",
                  }}
                  initial={{ scale: 0.2, rotate: i * 60, opacity: 0 }}
                  animate={{ scale: 1, rotate: i * 60 + 30, opacity: 1 }}
                  transition={{ duration: 1.4, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                />
              ))}
            </div>
            <motion.p
              className="mt-10 text-[0.7rem] tracking-[0.5em] uppercase gold-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              Flower Industries
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}