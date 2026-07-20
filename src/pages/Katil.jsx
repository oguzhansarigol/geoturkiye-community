import Page from "../components/Page.jsx";
import Reveal from "../components/Reveal.jsx";
import Btn from "../components/Btn.jsx";
import CtaBand from "../components/CtaBand.jsx";
import { DISCORD_URL } from "../config.js";
import { useLang } from "../i18n.jsx";

export default function Katil() {
  const { t } = useLang();
  const s = t.katil;

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

      <section className="section" style={{ paddingTop: 28 }}>
        <div className="container">
          <Reveal className="section-head">
            <p className="eyebrow">{s.adimEyebrow}</p>
            <h2>{s.adimH2}</h2>
          </Reveal>
          <div className="steps">
            {s.adimlar.map((a, i) => (
              <Reveal className="step" key={a.ad} delay={i * 0.05}>
                <div>
                  <h3>{a.ad}</h3>
                  <p>{a.p}</p>
                  {a.btnTip === "discord" && (
                    <Btn href={DISCORD_URL} kind="red" arrow="↗">{a.btn}</Btn>
                  )}
                  {a.btnTip === "etkinlik" && (
                    <Btn to="/etkinlikler" kind="ghost" arrow="→">{a.btn}</Btn>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container twocol">
          <Reveal className="sticky-side">
            <p className="eyebrow">{s.kuralEyebrow}</p>
            <h2 className="side-h2">{s.kuralH2}</h2>
            <p className="lead" style={{ marginTop: 16 }}>{s.kuralLead}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <ul className="rule-list">
              {s.kurallar.map((k) => (
                <li key={k.no}>
                  <span className="r-no">{k.no}</span>
                  <div><b>{k.b}</b> <span>{k.p}</span></div>
                </li>
              ))}
            </ul>
            <p className="rule-foot">{s.kuralNot}</p>
          </Reveal>
        </div>
      </section>

      <section className="section" id="sss" style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal className="section-head">
            <p className="eyebrow">{s.sssEyebrow}</p>
            <h2>{s.sssH2}</h2>
          </Reveal>
          <Reveal className="faq">
            {s.sss.map((x) => (
              <details key={x.s}>
                <summary>{x.s}<span className="fx">+</span></summary>
                <div className="faq-body">{x.c}</div>
              </details>
            ))}
          </Reveal>
        </div>
      </section>

      <CtaBand eyebrow={s.ctaEyebrow} title={s.ctaH2} note={s.ctaNot}>
        <Btn href={DISCORD_URL} kind="light" arrow="↗">{s.ctaBtn2}</Btn>
      </CtaBand>
    </Page>
  );
}
