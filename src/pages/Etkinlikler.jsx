import { useState } from "react";
import Page from "../components/Page.jsx";
import Reveal from "../components/Reveal.jsx";
import Btn from "../components/Btn.jsx";
import CtaBand from "../components/CtaBand.jsx";
import TurnuvaBasvuru from "../components/TurnuvaBasvuru.jsx";
import { DISCORD_URL } from "../config.js";
import { useLang } from "../i18n.jsx";

// İnşaat işareti (uyarı üçgeni)
function InsaatIkon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" d="M12 3.5 21.5 20h-19Z" />
      <line x1="12" y1="10" x2="12" y2="14.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="17.2" r="1.25" fill="currentColor" />
    </svg>
  );
}

export default function Etkinlikler() {
  const { t } = useLang();
  const s = t.etkinlikler;
  // Açık turnuva var mı? "var" ise inşaat bildirimi gizlenir.
  const [turnuvaDurum, setTurnuvaDurum] = useState("bilinmiyor");

  return (
    <Page title={s.title} description={s.desc}>
      <section className="page-hero">
        <div className="container">
          <Reveal><p className="eyebrow">{s.eyebrow}</p></Reveal>
          <Reveal delay={0.06}><h1>{s.h1}</h1></Reveal>
          <Reveal delay={0.12}><p className="lead">{s.lead}</p></Reveal>
        </div>
        <span className="page-coords">{s.koordinat}</span>
      </section>

      {/* Açık turnuvalar + başvuru formu (Supabase) */}
      <TurnuvaBasvuru onDurum={setTurnuvaDurum} />

      {/* İnşaat hâlinde bildirimi — açık turnuva yoksa gösterilir */}
      {turnuvaDurum !== "var" && (
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="notice-plate construction">
              <div className="hazard" aria-hidden="true"></div>
              <i className="ch bl"></i><i className="ch br"></i>
              <p className="notice-tag"><InsaatIkon /> {s.insaTag}</p>
              <h3>{s.insaH3}</h3>
              <p>{s.insaP}</p>
              <div className="notice-actions">
                <Btn href={DISCORD_URL} kind="red" arrow="↗">{s.insaBtn}</Btn>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
      )}

      {/* Geçmiş turnuvalar */}
      <section className="section" style={{ paddingTop: 0 }}>
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
                    </tr>
                  ))}
                </tbody>
              </table>
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
