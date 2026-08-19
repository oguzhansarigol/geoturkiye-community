import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { bayrakUrl } from "../geoProfil.js";
import { oyuncuYolu, TUR_SIRASI } from "../turnuvaAgaci.js";

// ============================================================
// Turnuva sayfası yapı taşları: oyuncu avatarı, oyuncu kartı,
// oyuncu detay penceresi ve güncel eşleşme şeridi.
// Veriler useTurnuvaSayfasi (turnuvaSayfa.js) tarafından hazırlanır.
// ============================================================

const LIG_RENK = {
  champion: "#C62231",
  master: "#7C3AED",
  gold: "#C99700",
  silver: "#7E8A93",
  bronze: "#A9714B",
};

function ligRengi(lig) {
  const anahtar = lig && Object.keys(LIG_RENK).find((k) => lig.toLowerCase().includes(k));
  return anahtar ? LIG_RENK[anahtar] : "var(--ink-2)";
}

// ---------- Bayrak ----------
function Bayrak({ ulke }) {
  const src = bayrakUrl(ulke);
  if (!src) return null;
  return <img className="oyuncu-bayrak" src={src} alt={ulke.toUpperCase()} title={ulke.toUpperCase()} loading="lazy" />;
}

// ---------- Avatar ----------
// profil yüklenene kadar (veya görsel yoksa) adın baş harfi görünür
export function Avatar({ src, ad, sinif = "" }) {
  return (
    <span className={`oyuncu-avatar ${sinif}`} aria-hidden="true">
      {src ? <img src={src} alt="" loading="lazy" /> : <span className="oyuncu-avatar-harf">{(ad || "?")[0]}</span>}
    </span>
  );
}

// ---------- Oyuncu durumu ----------
// turlar'dan her oyuncunun durumu: "sampiyon" | "elendi" | "devam"
export function oyuncuDurumlari(turlar, adlar) {
  const m = {};
  for (const ad of adlar) {
    const yol = oyuncuYolu(turlar, ad);
    const son = yol[yol.length - 1];
    if (yol.some((a) => a.sonuc === "kaybetti")) m[ad] = "elendi";
    else if (son && son.tur === "f" && son.sonuc === "kazandi") m[ad] = "sampiyon";
    else m[ad] = "devam";
  }
  return m;
}

// ---------- Oyuncu kartı ----------
export function OyuncuKart({ oyuncu, durum, torbaNo, s, onClick }) {
  const p = oyuncu.profil;
  const lig = p?.lig || null;
  return (
    <button
      type="button"
      className={`oyuncu-kart oyuncu-kart--${durum}`}
      onClick={() => onClick(oyuncu)}
      aria-label={oyuncu.ad}
    >
      <Avatar src={p?.avatar} ad={oyuncu.ad} sinif="oyuncu-avatar--kart" />
      <span className="oyuncu-kart-ad" title={oyuncu.ad}>{oyuncu.ad}</span>
      <span className="oyuncu-kart-alt">
        <Bayrak ulke={p?.ulke} />
        {p?.seviye != null && <span>{s.seviye} {p.seviye}</span>}
        {torbaNo && <span className="oyuncu-torba">{s.torba} {torbaNo}</span>}
      </span>
      {lig && (
        <span className="oyuncu-lig" style={{ color: ligRengi(lig) }}>
          <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
            <path fill="currentColor" d="M12 2 20 5v6c0 5-3.4 9.2-8 11-4.6-1.8-8-6-8-11V5Z" />
          </svg>
          {lig}
        </span>
      )}
      {durum === "sampiyon" && <span className="oyuncu-rozet oyuncu-rozet--sampiyon">★ {s.sampiyon}</span>}
      {durum === "elendi" && <span className="oyuncu-rozet">{s.elendi}</span>}
    </button>
  );
}

// ---------- Oyuncu detay penceresi ----------
export function OyuncuDetay({ oyuncu, turlar, turAdlari, avatarlar, durum, torbaNo, s, onKapat, onOyuncu }) {
  const kapatRef = useRef(null);
  const p = oyuncu.profil;
  const yol = oyuncuYolu(turlar, oyuncu.ad);

  useEffect(() => {
    kapatRef.current?.focus();
    const tus = (e) => { if (e.key === "Escape") onKapat(); };
    document.addEventListener("keydown", tus);
    const eskiOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", tus);
      document.body.style.overflow = eskiOverflow;
    };
  }, [onKapat]);

  const durumEtiket = durum === "sampiyon" ? `★ ${s.sampiyon}` : durum === "elendi" ? s.elendi : s.devam;

  return (
    <div className="oyuncu-detay-kapak" onClick={onKapat} role="presentation">
      <div
        className="oyuncu-detay"
        role="dialog"
        aria-modal="true"
        aria-label={oyuncu.ad}
        onClick={(e) => e.stopPropagation()}
      >
        <button ref={kapatRef} type="button" className="oyuncu-detay-kapat" onClick={onKapat} aria-label={s.kapat}>×</button>
        <div className="oyuncu-detay-ust">
          <Avatar src={p?.tamBoy || p?.avatar} ad={oyuncu.ad} sinif={p?.tamBoy ? "oyuncu-avatar--tam" : "oyuncu-avatar--buyuk"} />
          <div>
            <p className="eyebrow">{durumEtiket}</p>
            <h3 className="oyuncu-detay-ad">
              <Bayrak ulke={p?.ulke} /> {oyuncu.ad}
            </h3>
            <dl className="oyuncu-detay-bilgi">
              {torbaNo && <><dt>{s.torba}</dt><dd>{torbaNo}</dd></>}
              {p?.seviye != null && <><dt>{s.seviye}</dt><dd>{p.seviye}</dd></>}
              {p?.lig && <><dt>{s.lig}</dt><dd style={{ color: ligRengi(p.lig), fontWeight: 600 }}>{p.lig}</dd></>}
              {p?.puan != null && <><dt>{s.puan}</dt><dd>{p.puan}</dd></>}
              {p?.duello && (
                <><dt>{s.duello}</dt><dd>{p.duello.oynanan} · {p.duello.kazanilan} {s.galibiyet}</dd></>
              )}
            </dl>
            {oyuncu.profilUrl && (
              <a className="yayin-link" href={oyuncu.profilUrl} target="_blank" rel="noreferrer">
                {s.profil} ↗
              </a>
            )}
          </div>
        </div>

        <div className="oyuncu-yol">
          <p className="agac-tur-ad" style={{ textAlign: "left" }}>{s.yol}</p>
          {yol.length === 0 ? (
            <p className="t-day">{s.bekleniyor}</p>
          ) : (
            <ol>
              {yol.map((a) => {
                const sinif = a.sonuc === "kazandi" ? "kazandi" : a.sonuc === "kaybetti" ? "kaybetti" : "";
                return (
                  <li key={a.id} className={`oyuncu-yol-satir ${sinif}`}>
                    <span className="oyuncu-yol-tur">{turAdlari[TUR_SIRASI.indexOf(a.tur)]}</span>
                    {a.rakip ? (
                      <button type="button" className="oyuncu-yol-rakip" onClick={() => onOyuncu(a.rakip)}>
                        <Avatar src={avatarlar[a.rakip]} ad={a.rakip} sinif="oyuncu-avatar--mini" />
                        {a.rakip}
                      </button>
                    ) : (
                      <span className="oyuncu-yol-rakip t-day">{s.rakipBekleniyor}</span>
                    )}
                    <span className="oyuncu-yol-sonuc">
                      {a.sonuc === "kazandi" ? s.kazandi : a.sonuc === "kaybetti" ? s.kaybetti : s.oynanacak}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Güncel eşleşme şeridi ----------
// maclar: turlar[tur] listesi; ikisi de belli olan maçlar gösterilir
export function MacSeridi({ maclar, avatarlar, s, onOyuncu, dikey = false }) {
  const gosterilecek = maclar.filter((m) => m.ust && m.alt);
  if (gosterilecek.length === 0) return <p className="t-day">{s.bekleniyor}</p>;
  return (
    <div className={`mac-seridi${dikey ? " mac-seridi--dikey" : ""}`}>
      {gosterilecek.map((m) => (
        <div className={`mac-karti${m.kazanan ? " mac-karti--bitti" : ""}`} key={m.id}>
          {["ust", "alt"].map((taraf) => {
            const ad = m[taraf];
            const kazandi = m.kazanan === ad;
            const kaybetti = m.kazanan && !kazandi;
            return (
              <button
                key={taraf}
                type="button"
                className={`mac-oyuncu${kazandi ? " kazanan" : ""}${kaybetti ? " kaybeden" : ""}`}
                onClick={() => onOyuncu(ad)}
              >
                <Avatar src={avatarlar[ad]} ad={ad} sinif="oyuncu-avatar--mac" />
                <span className="mac-oyuncu-ad">{ad}</span>
              </button>
            );
          })}
          <span className="mac-vs" aria-hidden="true">{s.vs}</span>
        </div>
      ))}
    </div>
  );
}

// Geri dönüş linki (ortak)
export function TurnuvaGeri({ to, children }) {
  return <Link to={to} className="turnuva-geri">← {children}</Link>;
}
