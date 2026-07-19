import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { NOANIM } from "../anim.js";

// Görünür olunca 0'dan hedefe sayan sayaç
export default function CountUp({ value, duration = 1.3 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  const [n, setN] = useState(NOANIM ? value : 0);

  useEffect(() => {
    if (NOANIM || !inView) return;
    if (reduced) { setN(value); return; }
    let raf;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min((t - t0) / (duration * 1000), 1);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, reduced]);

  return <span ref={ref}>{n}</span>;
}
