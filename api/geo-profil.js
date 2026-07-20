// Vercel serverless fonksiyonu: /api/geo-profil?url=<geoguessr-profil-linki>
// Admin panelindeki başvuru listesi oyuncu adı/lig/düello bilgisini buradan alır.
import { profilIdCikar, geoProfilGetir } from "./_geoguessr.js";

export default async function handler(req, res) {
  const id = profilIdCikar(req.query?.url);
  if (!id) {
    return res.status(400).json({ hata: "gecersiz-profil" });
  }
  try {
    const veri = await geoProfilGetir(id);
    // CDN önbelleği: 1 saat taze, 1 gün bayat kullanım — GeoGuessr'ı yormayalım
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).json(veri);
  } catch {
    return res.status(502).json({ hata: "geoguessr-erisilemedi" });
  }
}
