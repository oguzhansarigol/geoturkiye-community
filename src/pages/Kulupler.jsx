import Page from "../components/Page.jsx";
import Reveal from "../components/Reveal.jsx";
import Btn from "../components/Btn.jsx";
import { useLang } from "../i18n.jsx";

// Kulüp bilgileri src/metinler.jsx içindeki kulupler.liste dizisinden gelir.
export default function Kulupler() {
  const { t } = useLang();
  const s = t.kulupler;

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

      <section className="section">
        <div className="container">
          <div className="club-grid">
            {s.liste.map((k, i) => (
              <Reveal key={k.url} delay={i * 0.07}>
                <article className="clubcard">
                  <div className="cc-top">
                    <img className="cc-logo" src="/kulup-logo.png" alt="" />
                    <span className={i === 0 ? "tag tag--red" : "tag"}>{k.tag}</span>
                  </div>
                  <h3>{k.ad}</h3>
                  <p>{k.p}</p>
                  <Btn href={k.url} kind={i === 0 ? "red" : "ghost"} arrow="↗">{s.katilBtn}</Btn>
                </article>
              </Reveal>
            ))}
          </div>
          <Reveal className="prose" delay={0.1}>
            <p className="muted" style={{ marginTop: 24 }}>{s.not}</p>
          </Reveal>
        </div>
      </section>
    </Page>
  );
}
