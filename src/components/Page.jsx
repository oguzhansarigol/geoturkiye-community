import { useEffect } from "react";
import { motion } from "motion/react";
import { NOANIM } from "../anim.js";
import { useLang } from "../i18n.jsx";

// Her sayfayı saran geçiş animasyonu + sekme başlığı + SEO açıklaması
export default function Page({ title, description, children }) {
  const { t, lang } = useLang();

  useEffect(() => {
    document.title = title ? `${title} · GeoGuessrTürkiye` : "GeoGuessrTürkiye";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", description || t.varsayilanAciklama);
  }, [title, description, lang, t]);

  return (
    <motion.main
      id="icerik"
      initial={NOANIM ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
    >
      {children}
    </motion.main>
  );
}
