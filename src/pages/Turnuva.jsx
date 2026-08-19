import { useCallback, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Page from "../components/Page.jsx";
import Reveal from "../components/Reveal.jsx";
import Btn from "../components/Btn.jsx";
import AgacGorunum from "../components/AgacGorunum.jsx";
import { MacSeridi, OyuncuDetay, OyuncuKart, TurnuvaGeri, oyuncuDurumlari } from "../components/TurnuvaOyuncular.jsx";
import { useTurnuvaSayfasi, turnuvaYolu } from "../turnuvaSayfa.js";
import { guncelTur, TUR_SIRASI } from "../turnuvaAgaci.js";
import { DISCORD_URL } from "../config.js";
import { useLang } from "../i18n.jsx";

// ============================================================
// /turnuva/:kimlik — izleyici sayfası
// Üstte güncel eşleşmeler ve turnuva ağacı (avatarlı), altta tüm
// oyuncuların kartları. Oyuncuya tıklanınca detay penceresi açılır
// (GeoGuessr profili + turnuva yolu). Ağaç yayında değilse "yok" mesajı.
// ============================================================

export default function Turnuva() {
  const { kimlik } = useParams();
  const { t } = useLang();
  const s = t.turnuva;
  const turAdlari = t.etkinlikler.agacTurlar;
  const { durum, agac, turnuva, oyuncular, avatarlar, turlar } = useTurnuvaSayfasi(kimlik);
  const [seciliAd, setSeciliAd] = useState(null);

  const oyuncuMap = useMemo(() => Object.fromEntries(oyuncular.map((o) => [o.ad, o])), [oyuncular]);
  const durumlar = useMemo(
    () => (turlar ? oyuncuDurumlari(turlar, oyuncular.map((o) => o.ad)) : {}),
    [turlar, oyuncular]
  );
  const torbaNo = useCallback(
    (ad) => {
      const i = (agac?.torbalar || []).findIndex((tb) => tb.includes(ad));
      return i === -1 ? null : i + 1;
    },
    [agac]
  );
  const kapat = useCallback(() => setSeciliAd(null), []);
  const ac = useCallback((ad) => { if (ad) setSeciliAd(ad); }, []);

  if (durum !== "hazir") {
    return (
      <Page title={s.eyebrow} description={s.desc}>
        <section className="page-hero">
          <div className="container">
            <Reveal><p className="eyebrow">{s.eyebrow}</p></Reveal>
            <Reveal delay={0.06}>
              <h1>{durum === "yukleniyor" ? s.yukleniyor : s.yok}</h1>
            </Reveal>
            {durum === "yok" && (
              <Reveal delay={0.12}><p className="lead"><TurnuvaGeri to="/etkinlikler">{s.geri}</TurnuvaGeri></p></Reveal>
            )}
          </div>
        </section>
      </Page>
    );
  }

  const tur = guncelTur(turlar);
  const kuraCekildi = (agac.bolgeler || []).length > 0;
  const sampiyon = turlar.f[0].kazanan;
  const secili = seciliAd ? oyuncuMap[seciliAd] || { ad: seciliAd, profil: null, profilUrl: null } : null;

  return (
    <Page title={turnuva.ad} description={turnuva.aciklama || s.desc}>
      {/* ---- Başlık ---- */}
      <section className="page-hero turnuva-hero">
        <div className="container">
          <Reveal><p className="eyebrow">{s.eyebrow}</p></Reveal>
          <Reveal delay={0.06}><h1>{turnuva.ad}</h1></Reveal>
          <Reveal delay={0.1}>
            <p className="t-kart-meta turnuva-hero-meta">
              {turnuva.format && <span className="tag">{turnuva.format}</span>}
              {turnuva.tarih && <span className="t-day">{turnuva.tarih}</span>}
              {oyuncular.length > 0 && <span className="t-day">{oyuncular.length} {s.oyuncuSayisi}</span>}
            </p>
          </Reveal>
          {turnuva.aciklama && <Reveal delay={0.14}><p className="lead">{turnuva.aciklama}</p></Reveal>}
          <Reveal delay={0.18}>
            <div className="turnuva-hero-btnler">
              <Btn to={turnuvaYolu(agac, true)} kind="red" arrow="→">
                <span className="turnuva-bar-nokta" aria-hidden="true" /> {s.canliBtn}
              </Btn>
              <Btn href="#oyuncular" kind="ghost" arrow="↓">{s.oyuncularBtn}</Btn>
              <Btn href={DISCORD_URL} kind="ghost" arrow="↗">Discord</Btn>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- Güncel eşleşmeler ---- */}
      <section className="section" style={{ paddingTop: "clamp(28px, 5vh, 48px)", paddingBottom: 0 }}>
        <div className="container">
          <Reveal className="agac-kart turnuva-guncel">
            <div className="agac-kart-ust">
              <div>
                <p className="eyebrow">{s.guncelEyebrow}</p>
                <h3 className="t-kart-ad" style={{ marginTop: 10 }}>
                  {tur ? turAdlari[TUR_SIRASI.indexOf(tur)] : sampiyon ? s.tamamlandi : s.guncelBaslik}
                </h3>
              </div>
              {sampiyon && (
                <p className="turnuva-sampiyon-satir">
                  <span className="tag turnuva-acik">★ {s.sampiyon}</span> <b>{sampiyon}</b>
                </p>
              )}
            </div>
            {!kuraCekildi ? (
              <p className="t-day">{s.kuraBekleniyor}</p>
            ) : tur ? (
              <MacSeridi maclar={turlar[tur]} avatarlar={avatarlar} s={s} onOyuncu={ac} />
            ) : null}
          </Reveal>
        </div>
      </section>

      {/* ---- Ağaç ---- */}
      <section className="section" id="agac" style={{ paddingTop: "clamp(28px, 5vh, 48px)", paddingBottom: 0, scrollMarginTop: "90px" }}>
        <div className="container">
          <Reveal>
            <div className="agac-kart">
              <div className="agac-kart-ust">
                <h3 className="t-kart-ad">{s.agacH2}</h3>
                <p className="t-day">{s.agacNot}</p>
              </div>
              <AgacGorunum
                bolgeler={agac.bolgeler}
                sonuclar={agac.sonuclar}
                turAdlari={turAdlari}
                sampiyonEtiket={s.sampiyon}
                avatarlar={avatarlar}
                onOyuncu={ac}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- Oyuncular ---- */}
      <section className="section" id="oyuncular" style={{ scrollMarginTop: "90px" }}>
        <div className="container">
          <Reveal className="section-head">
            <p className="eyebrow">{s.oyuncularEyebrow}</p>
            <h2>{s.oyuncularH2}</h2>
          </Reveal>
          {oyuncular.length === 0 && <Reveal><p className="t-day">{s.oyuncuYok}</p></Reveal>}
          <div className="oyuncu-izgara">
            {oyuncular.map((o, i) => (
              <Reveal key={o.ad} delay={Math.min(i * 0.03, 0.4)}>
                <OyuncuKart
                  oyuncu={o}
                  durum={durumlar[o.ad] || "devam"}
                  torbaNo={torbaNo(o.ad)}
                  s={s}
                  onClick={(oy) => ac(oy.ad)}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {secili && (
        <OyuncuDetay
          oyuncu={secili}
          turlar={turlar}
          turAdlari={turAdlari}
          avatarlar={avatarlar}
          durum={durumlar[secili.ad] || "devam"}
          torbaNo={torbaNo(secili.ad)}
          s={s}
          onKapat={kapat}
          onOyuncu={ac}
        />
      )}
    </Page>
  );
}
