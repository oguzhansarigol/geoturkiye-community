import { useEffect, useRef, useState } from "react";

// ============================================================
// Admin başvuru tablosu (turnuva + kulüp başvurularında ortak):
// GeoGuessr profil zenginleştirme, lig rozeti, kompakt filtre ve
// sıralama menüleri. Sadece admin panelinde kullanılır (Türkçe).
// ============================================================

const BASVURU_ETIKET = { bekliyor: "Bekliyor", onaylandi: "Onaylandı", reddedildi: "Reddedildi" };

// ---------- GeoGuessr profil önbelleği ----------
// Aynı url için tek istek atılır; sonuca birden çok bileşen abone
// olabilir (StrictMode'un çift mount'u dahil).
const profilOnbellek = new Map(); // url -> veri (obje | null)
const bekleyen = new Map();      // url -> devam eden istek (Promise)

function profilGetir(url) {
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

function useGeoProfiller(satirlar) {
  const [profiller, setProfiller] = useState({});
  const anahtar = satirlar.map((b) => b.oyun_profili).join("|");

  useEffect(() => {
    let iptal = false;
    satirlar.forEach(({ oyun_profili: url }) => {
      profilGetir(url).then((v) => {
        if (!iptal) setProfiller((p) => (p[url] === v ? p : { ...p, [url]: v }));
      });
    });
    return () => { iptal = true; };
  }, [anahtar]);

  return profiller;
}

// ---------- Lig rozeti ----------
const LIG_RENK = {
  champion: "#C62231",
  master: "#7C3AED",
  gold: "#C99700",
  silver: "#7E8A93",
  bronze: "#A9714B",
};

function LigRozet({ lig }) {
  if (!lig) return <span className="t-day">Lig: —</span>;
  const anahtar = Object.keys(LIG_RENK).find((k) => lig.toLowerCase().includes(k));
  const renk = anahtar ? LIG_RENK[anahtar] : "#6B6353";
  return (
    <span className="lig-rozet" style={{ color: renk }}>
      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 2 20 5v6c0 5-3.4 9.2-8 11-4.6-1.8-8-6-8-11V5Z"
        />
        <path fill="#fff" d="m12 7 1.45 2.94 3.25.47-2.35 2.29.55 3.23L12 14.4l-2.9 1.53.55-3.23L7.3 10.4l3.25-.47Z" />
      </svg>
      {lig}
    </span>
  );
}

// ---------- Menü ikonları ----------
function FiltreIkon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        d="M3 5h18l-7 8v5.5l-4 2V13Z" />
    </svg>
  );
}

function SiralaIkon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 4v16M8 4 5 7.2M8 4l3 3.2" />
        <path d="M16 20V4m0 16 3-3.2m-3 3.2-3-3.2" />
      </g>
    </svg>
  );
}

// ---------- Kompakt açılır menü (ikon buton) ----------
function Acilir({ etiket, ikon, aktif, varsayilan, secenekler, onSec }) {
  const [acik, setAcik] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!acik) return;
    const kapat = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAcik(false);
    };
    document.addEventListener("mousedown", kapat);
    return () => document.removeEventListener("mousedown", kapat);
  }, [acik]);

  // Varsayılan dışında bir seçim varsa buton "aktif" görünür kalır
  const seciliMi = aktif !== varsayilan;

  return (
    <div className="acilir" ref={ref}>
      <button
        className={`admin-mini ikon-btn${acik || seciliMi ? " aktif" : ""}`}
        title={etiket}
        aria-label={etiket}
        onClick={() => setAcik(!acik)}
      >
        {ikon}
      </button>
      {acik && (
        <div className="acilir-panel">
          {secenekler.map(([k, ad]) => (
            <button
              key={k}
              className={k === aktif ? "secili" : ""}
              onClick={() => { onSec(k); setAcik(false); }}
            >
              {ad}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Ana tablo ----------
// satirlar: basvuru kayıtları; ekKolon: { baslik, deger(b) } (örn. Kulüp kolonu)
export default function BasvuruTablosu({ satirlar, ekKolon, onDurumDegistir, onSil }) {
  const [filtre, setFiltre] = useState("hepsi");
  const [sirala, setSirala] = useState("yeni");
  const profiller = useGeoProfiller(satirlar);

  const sayi = { bekliyor: 0, onaylandi: 0, reddedildi: 0 };
  satirlar.forEach((b) => { sayi[b.durum] += 1; });

  const siralayici = {
    yeni: (a, b) => b.created_at.localeCompare(a.created_at),
    eski: (a, b) => a.created_at.localeCompare(b.created_at),
    discord: (a, b) => a.discord_kullanici.localeCompare(b.discord_kullanici, "tr"),
    puan: (a, b) =>
      (profiller[b.oyun_profili]?.puan ?? -1) - (profiller[a.oyun_profili]?.puan ?? -1) ||
      b.created_at.localeCompare(a.created_at),
    durum: (a, b) => {
      const s = { bekliyor: 0, onaylandi: 1, reddedildi: 2 };
      return s[a.durum] - s[b.durum] || b.created_at.localeCompare(a.created_at);
    },
  };

  const gorunen = satirlar
    .filter((b) => filtre === "hepsi" || b.durum === filtre)
    .sort(siralayici[sirala]);

  return (
    <>
      <div className="admin-arac">
        <div className="admin-satir">
          <Acilir
            etiket="Filtre"
            ikon={<FiltreIkon />}
            varsayilan="hepsi"
            aktif={filtre}
            onSec={setFiltre}
            secenekler={[
              ["hepsi", `Tümü (${satirlar.length})`],
              ["bekliyor", `Bekliyor (${sayi.bekliyor})`],
              ["onaylandi", `Onaylandı (${sayi.onaylandi})`],
              ["reddedildi", `Reddedildi (${sayi.reddedildi})`],
            ]}
          />
          <Acilir
            etiket="Sırala"
            ikon={<SiralaIkon />}
            varsayilan="yeni"
            aktif={sirala}
            onSec={setSirala}
            secenekler={[
              ["yeni", "Yeni → Eski"],
              ["eski", "Eski → Yeni"],
              ["puan", "Puan (yüksekten)"],
              ["discord", "Discord A-Z"],
              ["durum", "Duruma göre"],
            ]}
          />
        </div>
        <p className="admin-ozet">
          <b className="onay-sayi">{sayi.onaylandi}</b> onaylandı · {sayi.bekliyor} bekliyor · {sayi.reddedildi} reddedildi
        </p>
      </div>

      <div className="table-scroll">
        <table className="fixture admin-tablo">
          <thead>
            <tr>
              {ekKolon && <th>{ekKolon.baslik}</th>}
              <th>Discord</th>
              <th>Oyuncu</th>
              <th>Ad Soyad</th>
              <th>Tarih</th>
              <th>Durum</th>
              <th className="kolon-islem">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {gorunen.map((b) => {
              const p = profiller[b.oyun_profili]; // undefined = yükleniyor, null = alınamadı
              return (
                <tr key={b.id}>
                  {ekKolon && <td className="t-day">{ekKolon.deger(b)}</td>}
                  <td><div className="t-name">{b.discord_kullanici}</div></td>
                  <td>
                    <div className="geo-profil">
                      <a className="admin-link" href={b.oyun_profili} target="_blank" rel="noopener">
                        {p?.nick || "Profil"} ↗
                      </a>
                      <span className="geo-alt">
                        {p === undefined && <span className="t-day">yükleniyor…</span>}
                        {p === null && <span className="t-day">veri alınamadı</span>}
                        {p && (
                          <>
                            <LigRozet lig={p.lig} />
                            {p.puan != null && <span className="t-day">{p.puan} puan</span>}
                            {p.duello && (
                              <span className="t-day">{p.duello.oynanan} düello / {p.duello.kazanilan} G</span>
                            )}
                          </>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="kolon-ad">{b.ad_soyad || "—"}</td>
                  <td className="t-day">{new Date(b.created_at).toLocaleDateString("tr-TR")}</td>
                  <td><span className={`tag basvuru-${b.durum}`}>{BASVURU_ETIKET[b.durum]}</span></td>
                  <td className="kolon-islem">
                    <div className="admin-islemler">
                      {b.durum !== "onaylandi" && (
                        <button className="admin-mini onay" onClick={() => onDurumDegistir(b.id, "onaylandi")}>Onayla</button>
                      )}
                      {b.durum !== "reddedildi" && (
                        <button className="admin-mini red" onClick={() => onDurumDegistir(b.id, "reddedildi")}>Reddet</button>
                      )}
                      {b.durum !== "bekliyor" && (
                        <button className="admin-mini" onClick={() => onDurumDegistir(b.id, "bekliyor")}>Beklet</button>
                      )}
                      <button className="admin-mini" onClick={() => onSil(b.id)}>Sil</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
