// ============================================================
// GeoGuessr profil verisi çekme (sunucu tarafı ortak modül)
// Tarayıcı CORS engeli nedeniyle bu istekler sunucudan yapılır:
// üretimde api/geo-profil.js (Vercel), geliştirmede vite.config.js
// içindeki middleware bu modülü kullanır.
// Dosya adı "_" ile başladığı için Vercel bunu endpoint yapmaz.
// ============================================================

const UA = "Mozilla/5.0 (compatible; GeoTurkiyeAdmin/1.0)";
const ID_RE = /geoguessr\.com\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?user\/([a-f0-9]{24})/i;

// Profil linkinden 24 haneli kullanıcı id'sini çıkarır; geçersizse null.
export function profilIdCikar(url) {
  const m = ID_RE.exec(String(url || ""));
  return m ? m[1].toLowerCase() : null;
}

async function jsonGetir(url) {
  const r = await fetch(url, {
    headers: { "user-agent": UA, accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
}

// Üç kaynaktan olabildiğince veri toplar; herhangi biri başarısız
// olsa da elde edilenler döner.
export async function geoProfilGetir(id) {
  const [kullanici, lig, sayfa] = await Promise.allSettled([
    jsonGetir(`https://www.geoguessr.com/api/v3/users/${id}`),
    jsonGetir(`https://www.geoguessr.com/api/v4/ranked-system/progress/${id}`),
    fetch(`https://www.geoguessr.com/user/${id}`, {
      headers: { "user-agent": UA },
      signal: AbortSignal.timeout(8000),
    }).then((r) => (r.ok ? r.text() : "")),
  ]);

  const veri = { id };

  if (kullanici.status === "fulfilled") {
    const u = kullanici.value;
    veri.nick = u.nick;
    veri.ulke = u.countryCode || null;
    veri.seviye = u.progress?.level ?? null;
  }

  if (lig.status === "fulfilled") {
    const l = lig.value;
    veri.lig = l.divisionName || l.tier || null;
    veri.puan = l.rating ?? null;
    veri.modPuanlari = l.gameModeRatings || null;
  }

  // Düello sayıları sadece profil sayfasının gömülü verisinde bulunuyor
  if (sayfa.status === "fulfilled" && sayfa.value) {
    const m = /"duels":\{"numGamesPlayed":(\d+)[^}]*?"numWins":(\d+)/.exec(sayfa.value);
    if (m) veri.duello = { oynanan: Number(m[1]), kazanilan: Number(m[2]) };
  }

  if (!veri.nick && !veri.lig) throw new Error("profil-verisi-yok");
  return veri;
}
