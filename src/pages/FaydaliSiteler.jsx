import Page from "../components/Page.jsx";
import Reveal from "../components/Reveal.jsx";
import Btn from "../components/Btn.jsx";
import CtaBand from "../components/CtaBand.jsx";
import { DISCORD_URL } from "../config.js";
import { useLang } from "../i18n.jsx";

// Siteleri eklemek/çıkarmak için src/metinler.jsx içindeki
// faydali.siteler dizilerini (tr + en) düzenleyin.
export default function FaydaliSiteler() {
  const { t } = useLang();
  const s = t.faydali;

  return (
    <Page title={s.title} description={s.desc}>
      <section className="page-hero">
        <div className="container">
          <Reveal><p className="eyebrow">{s.eyebrow}</p></Reveal>
          <Reveal delay={0.06}><h1>{s.h1}</h1></Reveal>
          <Reveal delay={0.12}><p className="lead">{s.lead}</p></Reveal>
        </div>
        <span className="page-coords">{s.siteler.length} {s.koordinatSon}</span>
      </section>

      <section className="section">
        <div className="container">
          <div className="numrows">
            {s.siteler.map((x, i) => (
              <Reveal key={x.no} delay={i * 0.04}>
                <a className="numrow" href={x.url} target="_blank" rel="noopener">
                  <span className="no">{x.no}</span>
                  <div className="site-head">
                    <img
                      className="site-ico"
                      src={`/ikonlar/${x.host.split("/")[0]}.png`}
                      alt=""
                      loading="lazy"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                    <div>
                      <h3>{x.ad}</h3>
                      <p className="site-url">{x.host}</p>
                    </div>
                  </div>
                  <p>{x.p}</p>
                  <span className="row-arr">↗</span>
                </a>
              </Reveal>
            ))}
          </div>
          <Reveal className="prose" delay={0.1}>
            <p className="muted" style={{ marginTop: 24 }}>{s.not}</p>
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
