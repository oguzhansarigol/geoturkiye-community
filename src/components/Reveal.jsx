import { motion } from "motion/react";
import { NOANIM } from "../anim.js";

// Kaydırınca görünür olma animasyonu — tüm sayfalarda kullanılan temel sarmalayıcı
export default function Reveal({ children, delay = 0, y = 18, className, ...rest }) {
  return (
    <motion.div
      className={className}
      initial={NOANIM ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
