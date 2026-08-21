import { useCallback, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Page from "../components/Page.jsx";
import Reveal from "../components/Reveal.jsx";
import Btn from "../components/Btn.jsx";
import AgacGorunum from "../components/AgacGorunum.jsx";
import { MacSeridi, OyuncuDetay, TurnuvaGeri, oyuncuDurumlari } from "../components/TurnuvaOyuncular.jsx";
import { useTurnuvaSayfasi, turnuvaYolu, yayinGomme } from "../turnuvaSayfa.js";
import { guncelTur, TUR_SIRASI } from "../turnuvaAgaci.js";
import { TURNUVA_YAYIN_URL } from "../config.js";
import { useLang } from "../i18n.jsx";

// ============================================================
// /turnuva/:kimlik/canli — canlı izleme sayfası
// Solda YouTube yayını (ağaçtaki yayin_url; boşsa kanal linki),
// sağda güncel eşleşmeler, altta ağaç. Oyuncuya tıklanınca detay.
// ============================================================

export default function TurnuvaCanli() {
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
  const kapat = useCallback(() => setSeciliAd(null), []);
  const ac = useCallback((ad) => { if (ad) setSeciliAd(ad); }, []);

  if (durum !== "hazir") {
    return (
      <Page title={s.canliTitle} description={s.desc}>
        <section className="page-hero">
          <div className="container">
            <Reveal><p className="eyebrow">{s.canliEyebrow}</p></Reveal>
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

  const yayinUrl = agac.yayin_url || TURNUVA_YAYIN_URL;
  const gomme = yayinGomme(agac.yayin_url);
  const tur = guncelTur(turlar);
  const sampiyon = turlar.f[0].kazanan;
  const secili = seciliAd ? oyuncuMap[seciliAd] || { ad: seciliAd, profil: null, profilUrl: null } : null;
  return (
    <Page title={`${turnuva.ad} · ${s.canliTitle}`} description={turnuva.aciklama || s.desc}>
      <section className="page-hero canli-hero">
        <div className="container">
          <Reveal><TurnuvaGeri to={turnuvaYolu(agac)}>{s.sayfayaDon}</TurnuvaGeri></Reveal>
          <Reveal delay={0.04}>
            <p className="eyebrow" style={{ marginTop: 14 }}>
              <span className="turnuva-bar-nokta canli-nokta" aria-hidden="true" /> {s.canliEyebrow}
            </p>
          </Reveal>
          <Reveal delay={0.08}><h1>{turnuva.ad}</h1></Reveal>
        </div>
      </section>

      <section className="section" style={{ paddingTop: "clamp(24px, 4vh, 40px)" }}>
        <div className="container">
          <div className="canli-izgara">
            {/* ---- Yayın ---- */}
            <Reveal className="canli-yayin">
              {gomme ? (
                <div className="canli-cerceve">
                  <iframe
                    src={gomme}
                    title={`${turnuva.ad} · ${s.canliTitle}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
              ) : (
                <div className="canli-cerceve canli-cerceve--bos">
                  <p>{agac.yayin_url ? s.yayinGomulemedi : s.yayinYok}</p>
                </div>
              )}
              <div className="canli-alt">
                <Btn href={yayinUrl} kind="red" arrow="↗">{s.youtubeAc}</Btn>
                <Btn to={turnuvaYolu(agac)} kind="ghost" arrow="→">{s.sayfayaDon}</Btn>
              </div>
            </Reveal>

            {/* ---- Eşleşmeler ---- */}
            <Reveal className="canli-yan" delay={0.08}>
              <p className="eyebrow">{s.eslesmeler}</p>
              <h3 className="t-kart-ad" style={{ marginTop: 10 }}>
                {tur ? turAdlari[TUR_SIRASI.indexOf(tur)] : sampiyon ? s.tamamlandi : s.guncelBaslik}
              </h3>
              {sampiyon && (
                <p className="turnuva-sampiyon-satir">
                  <span className="tag turnuva-acik">★ {s.sampiyon}</span> <b>{sampiyon}</b>
                </p>
              )}
              {!(agac.bolgeler || []).length ? (
                <p className="t-day">{s.kuraBekleniyor}</p>
              ) : tur ? (
                <MacSeridi maclar={turlar[tur]} avatarlar={avatarlar} s={s} onOyuncu={ac} dikey />
              ) : null}
            </Reveal>
          </div>

          {/* ---- Ağaç ---- */}
          <Reveal delay={0.12}>
            <div className="agac-kart" style={{ marginTop: 24 }}>
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

      {secili && (
        <OyuncuDetay
          oyuncu={secili}
          turlar={turlar}
          turAdlari={turAdlari}
          avatarlar={avatarlar}
          durum={durumlar[secili.ad] || "devam"}
          s={s}
          onKapat={kapat}
          onOyuncu={ac}
        />
      )}
    </Page>
  );
}
