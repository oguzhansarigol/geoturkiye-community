import { useEffect, useState } from "react";

// ============================================================
// GeoGuessr profil önbelleği (istemci tarafı, ortak)
// /api/geo-profil üzerinden profil verisi çeker; aynı url için tek
// istek atılır, sonuca birden çok bileşen abone olabilir
// (StrictMode'un çift mount'u dahil). Admin başvuru tablosu ve
// turnuva sayfası oyuncu kartları bunu kullanır.
// ============================================================

const profilOnbellek = new Map(); // url -> veri (obje | null)
const bekleyen = new Map();      // url -> devam eden istek (Promise)

export function profilGetir(url) {
  if (!url) return Promise.resolve(null);
  if (profilOnbellek.has(url)) return Promise.resolve(profilOnbellek.get(url));
  if (!bekleyen.has(url)) {
    bekleyen.set(
      url,
      fetch(`/api/geo-profil?url=${encodeURIComponent(url)}`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null)
        .then((v) => {
          profilOnbellek.set(url, v);
          bekleyen.delete(url);
          return v;
        })
    );
  }
  return bekleyen.get(url);
}

// urller: profil linki dizisi → { [url]: veri | null } (yüklenenler geldikçe dolar)
export function useGeoProfiller(urller) {
  const [profiller, setProfiller] = useState({});
  const anahtar = urller.join("|");

  useEffect(() => {
    let iptal = false;
    urller.forEach((url) => {
      profilGetir(url).then((v) => {
        if (!iptal) setProfiller((p) => (p[url] === v ? p : { ...p, [url]: v }));
      });
    });
    return () => { iptal = true; };
  }, [anahtar]);

  return profiller;
}

// Ülke kodu ("tr") → bayrak görseli adresi; Windows bayrak emojisi
// göstermediği için görsel kullanılır. Geçersizse null.
export function bayrakUrl(ulke) {
  if (!ulke || !/^[a-z]{2}$/i.test(ulke)) return null;
  return `https://flagcdn.com/w40/${ulke.toLowerCase()}.png`;
}
