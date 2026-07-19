import { motion } from "motion/react";
import Page from "../components/Page.jsx";
import Reveal from "../components/Reveal.jsx";
import Btn from "../components/Btn.jsx";
import CtaBand from "../components/CtaBand.jsx";
import { DISCORD_URL } from "../config.js";
import { NOANIM } from "../anim.js";
import { useLang } from "../i18n.jsx";

// Atlas sayfalarının yelpaze düzeni: dıştakiler daha eğik ve aşağıda
const SAYFA_DURUS = [
  { rot: -5, y: 18 },
  { rot: -1.5, y: 0 },
  { rot: 1.5, y: 0 },
  { rot: 5, y: 18 },
];

// Pusula gülü (son sayfanın köşesine)
function PusulaGulu() {
  return (
    <svg className="ap-rose" viewBox="0 0 44 44" aria-hidden="true">
      <circle cx="22" cy="22" r="14" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="22" cy="22" r="2" fill="currentColor" />
      <path fill="currentColor" d="M22 3 24.6 19.4 41 22 24.6 24.6 22 41 19.4 24.6 3 22 19.4 19.4Z" opacity=".9" />
      <path fill="currentColor" d="M22 10 23.4 20.6 34 22 23.4 23.4 22 34 20.6 23.4 10 22 20.6 20.6Z" opacity=".45" transform="rotate(45 22 22)" />
    </svg>
  );
}

// Kırmızı kesikli rota çizgisi (görseldeki uçuş rotaları gibi)
function Rota({ ters = false }) {
  return (
    <svg className="ap-route" viewBox="0 0 200 34" preserveAspectRatio="none" aria-hidden="true">
      <path
        d={ters ? "M6 8 C 60 30, 140 2, 194 24" : "M6 26 C 66 2, 136 30, 194 10"}
        fill="none" stroke="currentColor" strokeWidth="1.6" strokeDasharray="5 6" strokeLinecap="round"
      />
      <circle cx="6" cy={ters ? 8 : 26} r="2.6" fill="currentColor" />
      <circle cx="194" cy={ters ? 24 : 10} r="2.6" fill="currentColor" />
    </svg>
  );
}

export default function Hakkimizda() {
  const { t } = useLang();
  const s = t.hakkimizda;

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
        <div className="container twocol">
          <Reveal className="sticky-side">
            <p className="eyebrow">{s.hikayeEyebrow}</p>
            <h2 className="side-h2">{s.hikayeH2}</h2>
          </Reveal>
          <Reveal className="prose" delay={0.1}>
            <p>{s.hikaye[0]}</p>
            <p>{s.hikaye[1]}</p>
            <p className="muted">{s.hikaye[2]}</p>
          </Reveal>
        </div>
      </section>

      {/* İlkeler: açık atlas — her ilke bir harita sayfası */}
      <section className="section section--dark atlas-sec">
        <div className="container">
          <Reveal className="section-head">
            <p className="eyebrow">{s.ilkeEyebrow}</p>
            <h2>{s.ilkeH2}</h2>
          </Reveal>
          <div className="atlas">
            <div className="atlas-glow" aria-hidden="true"></div>
            {s.ilkeler.map((d, i) => {
              const durus = SAYFA_DURUS[i] || { rot: 0, y: 0 };
              return (
                <motion.article
                  className="atlas-page"
                  key={d.no}
                  initial={NOANIM ? false : { opacity: 0, y: durus.y + 60, rotate: 0 }}
                  whileInView={{ opacity: 1, y: durus.y, rotate: durus.rot }}
                  whileHover={{ y: durus.y - 12, rotate: durus.rot / 3, scale: 1.02 }}
                  viewport={{ once: true, margin: "0px 0px -80px 0px" }}
                  transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }}
                >
                  <span className="ap-no">{d.no}</span>
                  <h3>{d.ad}</h3>
                  <p>{d.p}</p>
                  <Rota ters={i % 2 === 1} />
                  {i === s.ilkeler.length - 1 && <PusulaGulu />}
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container twocol">
          <Reveal className="sticky-side">
            <p className="eyebrow">{s.yolEyebrow}</p>
            <h2 className="side-h2">{s.yolH2}</h2>
          </Reveal>
          <div className="timeline">
            {s.yolculuk.map((y, i) => (
              <Reveal className="tl-item" key={y.ad} delay={i * 0.06}>
                <span className="tl-date">{y.tarih}</span>
                <h3>{y.ad}</h3>
                <p>{y.p}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal className="section-head">
            <p className="eyebrow">{s.ekipEyebrow}</p>
            <h2>{s.ekipH2}</h2>
            <p className="lead">{s.ekipLead}</p>
          </Reveal>
          <Reveal>
            <div className="role-grid">
              {s.ekip.map((e) => (
                <article className="role-cell" key={e.ic}>
                  <span className="r-ic">{e.ic}</span>
                  <h3>{e.ad}</h3>
                  <p>{e.p}</p>
                </article>
              ))}
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
