import Page from "../components/Page.jsx";
import Reveal from "../components/Reveal.jsx";
import Btn from "../components/Btn.jsx";
import CtaBand from "../components/CtaBand.jsx";
import TurnuvaBasvuru from "../components/TurnuvaBasvuru.jsx";
import { DISCORD_URL, GUNLUK_CHALLENGE_URL } from "../config.js";
import { useLang } from "../i18n.jsx";

export default function Etkinlikler() {
  const { t } = useLang();
  const s = t.etkinlikler;

  return (
    <Page title={s.title} description={s.desc}>
      <section className="page-hero page-hero--etkinlik">
        <div className="container">
          <Reveal><p className="eyebrow">{s.eyebrow}</p></Reveal>
          <Reveal delay={0.06}><h1>{s.h1}</h1></Reveal>
          <Reveal delay={0.12}><p className="lead">{s.lead}</p></Reveal>
        </div>
        <span className="page-coords">{s.koordinat}</span>
      </section>

      {/* Açık turnuvalar + başvuru formu (Supabase) */}
      <TurnuvaBasvuru />

      {/* Geçmiş turnuvalar */}
      <section className="section" style={{ paddingTop: "clamp(28px, 5vh, 48px)" }}>
        <div className="container">
          <Reveal className="section-head">
            <p className="eyebrow">{s.arsivEyebrow}</p>
            <h2>{s.arsivH2}</h2>
          </Reveal>
          <Reveal>
            <div className="table-scroll">
              <table className="fixture">
                <caption>{s.arsivH2}</caption>
                <thead>
                  <tr>{s.tabloBasliklar.map((b) => <th key={b}>{b}</th>)}</tr>
                </thead>
                <tbody>
                  {s.gecmis.map((g) => (
                    <tr key={g.no}>
                      <td className="t-day">{g.no}</td>
                      <td><div className="t-name">{g.ad}</div></td>
                      <td className="t-day">{g.tarih}</td>
                      <td><span className="tag">{g.tur}</span></td>
                      <td>
                        {g.yayin ? (
                          <a className="yayin-link" href={g.yayin} target="_blank" rel="noreferrer">
                            {s.izle} ↗
                          </a>
                        ) : (
                          <span className="yayin-yok" aria-hidden="true">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Günlük challenge — Discord'daki haftalık lig */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal>
            <div className="notice-plate">
              <p className="notice-tag">{s.gunlukTag}</p>
              <h3>{s.gunlukH3}</h3>
              <p>{s.gunlukP}</p>
              <div className="notice-actions">
                <Btn href={GUNLUK_CHALLENGE_URL} kind="red" arrow="↗">{s.gunlukBtn}</Btn>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBand eyebrow={s.ctaEyebrow} title={s.ctaH2}>
        <Btn href={DISCORD_URL} kind="light" arrow="↗">{s.ctaBtn1}</Btn>
        <Btn to="/katil" kind="ghost-light" arrow="→">{s.ctaBtn2}</Btn>
      </CtaBand>
    </Page>
  );
}
