import { useEffect } from "react";
import { motion } from "motion/react";
import { NOANIM } from "../anim.js";
import { useLang } from "../i18n.jsx";

const SITE_URL = "https://geoturkiye.community";

function etiketGuncelle(secici, deger) {
  const el = document.querySelector(secici);
  if (el) el.setAttribute(el.tagName === "LINK" ? "href" : "content", deger);
}

// Her sayfayı saran geçiş animasyonu + sekme başlığı + SEO etiketleri
// (başlık, açıklama, canonical, Open Graph / Twitter, hreflang)
export default function Page({ title, description, children }) {
  const { t, lang } = useLang();

  useEffect(() => {
    const tamBaslik = title ? `${title} · GeoGuessr Türkiye` : "GeoGuessr Türkiye";
    const aciklama = description || t.varsayilanAciklama;
    const yol = window.location.pathname === "/" ? "/" : window.location.pathname;
    const adres = `${SITE_URL}${yol}`;

    document.title = tamBaslik;
    etiketGuncelle('meta[name="description"]', aciklama);
    etiketGuncelle('link[rel="canonical"]', adres);
    etiketGuncelle('link[hreflang="tr"]', adres);
    etiketGuncelle('link[hreflang="en"]', `${adres}?dil=en`);
    etiketGuncelle('link[hreflang="x-default"]', adres);
    etiketGuncelle('meta[property="og:url"]', adres);
    etiketGuncelle('meta[property="og:title"]', tamBaslik);
    etiketGuncelle('meta[property="og:description"]', aciklama);
    etiketGuncelle('meta[name="twitter:title"]', tamBaslik);
    etiketGuncelle('meta[name="twitter:description"]', aciklama);
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
