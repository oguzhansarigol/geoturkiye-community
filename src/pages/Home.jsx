import { Fragment } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { Link } from "react-router-dom";
import Page from "../components/Page.jsx";
import Reveal from "../components/Reveal.jsx";
import Btn from "../components/Btn.jsx";
import Ticker from "../components/Ticker.jsx";
import LiveMap from "../components/LiveMap.jsx";
import CountUp from "../components/CountUp.jsx";
import CtaBand from "../components/CtaBand.jsx";
import AnimatedTopo from "../components/AnimatedTopo.jsx";
import { DISCORD_URL } from "../config.js";
import { NOANIM } from "../anim.js";
import { useLang } from "../i18n.jsx";

const wordAnim = (i) => ({
  initial: NOANIM ? false : { opacity: 0, y: 34 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.15 + i * 0.09 },
});

export default function Home() {
  const { t } = useLang();
  const s = t.home;
  const reduced = useReducedMotion();

  // Harita bölümü hafif parallax ile kayar
  const { scrollY } = useScroll();
  const mapYRaw = useTransform(scrollY, [0, 700], [0, -44]);
  const mapY = NOANIM || reduced ? 0 : mapYRaw;

  return (
    <Page>
      {/* ============ HERO ============ */}
      <section className="hero">
        <AnimatedTopo />
        <div className="container hero-grid">
          <div>
            <motion.p className="eyebrow" {...wordAnim(0)}>
              {s.eyebrow}
            </motion.p>
            <h1>
              {s.h1.map((k, i) =>
                k.accent ? (
                  <Fragment key={k.w}>
                    {i > 0 && " "}
                    {/* Vurgu kelimesi: diğerleri kayarken bu yavaşça belirir */}
                    <motion.span
                      className="w accent"
                      initial={NOANIM ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1.9, ease: "easeOut", delay: 0.75 }}
                    >
                      {k.w}
                    </motion.span>
                  </Fragment>
                ) : (
                  <Fragment key={k.w}>
                    {i > 0 && " "}
                    <motion.span className="w" {...wordAnim(1 + i)}>{k.w}</motion.span>
                  </Fragment>
                )
              )}
            </h1>
          </div>
          <motion.div
            className="hero-side"
            initial={NOANIM ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.55 }}
          >
            <p>{s.tanitim}</p>
            <div className="hero-cta">
              <Btn href={DISCORD_URL} kind="red" arrow="↗">{s.ctaDiscord}</Btn>
              <Btn to="/hakkimizda" kind="ghost" arrow="→">{s.ctaTani}</Btn>
            </div>
            <dl className="hero-meta">
              {s.meta.map(([dt, dd]) => (
                <Fragment key={dt}><dt>{dt}</dt><dd>{dd}</dd></Fragment>
              ))}
            </dl>
          </motion.div>
        </div>

        <div className="container map-plate-wrap">
          <motion.div
            className="map-hold"
            style={{ y: mapY }}
            initial={NOANIM ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.4 }}
          >
            <div className="map-live" aria-hidden="true">
              <span className="live-dot"></span> {s.canli}
            </div>
            <LiveMap />
          </motion.div>
        </div>

        <Ticker />
      </section>

      {/* ============ MANİFESTO ============ */}
      <section className="section manifesto">
        <div className="container manifesto-grid">
          <Reveal className="manifesto-text">
            <p>{s.manifesto1a}<em>{s.manifesto1em}</em>{s.manifesto1b}</p>
            <p>{s.manifesto2}</p>
          </Reveal>
          <ul className="fact-list">
            {s.faktalar.map((f, i) => (
              <motion.li
                key={f.l}
                initial={NOANIM ? false : { opacity: 0, x: 26 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "0px 0px -40px 0px" }}
                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.09 }}
              >
                <span className="fact-num">{f.say ? <CountUp value={f.n} /> : f.n}</span>
                <span className="fact-label">{f.l}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ NE YAPIYORUZ ============ */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal className="section-head">
            <p className="eyebrow">{s.neEyebrow}</p>
            <h2>{s.neH2}</h2>
          </Reveal>
          <div className="numrows">
            {s.neler.map((n, i) => (
              <Reveal key={n.no} delay={i * 0.05}>
                <Link className="numrow" to={n.to}>
                  <span className="no">{n.no}</span>
                  <h3>{n.baslik}</h3>
                  <p>{n.p}</p>
                  <span className="row-arr">↗</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TAKVİM ============ */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal className="section-head section-head--split">
            <div>
              <p className="eyebrow">{s.takvimEyebrow}</p>
              <h2>{s.takvimH2}</h2>
            </div>
            <Btn to="/etkinlikler" kind="ghost" arrow="→">{s.takvimBtn}</Btn>
          </Reveal>
          <Reveal>
            <div className="notice-plate">
              <i className="ch tl"></i><i className="ch tr"></i><i className="ch bl"></i><i className="ch br"></i>
              <p className="notice-tag">{s.programTag}</p>
              <h3>{s.programH3}</h3>
              <p>{s.programP}</p>
              <div className="notice-actions">
                <Btn href={DISCORD_URL} kind="red" arrow="↗">{s.programBtn1}</Btn>
                <Btn to="/etkinlikler" kind="ghost" arrow="→">{s.programBtn2}</Btn>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ MODLAR SÖZLÜĞÜ ============ */}
      <section className="section section--dark">
        <div className="container">
          <Reveal className="section-head">
            <p className="eyebrow">{s.sozlukEyebrow}</p>
            <h2>{s.sozlukH2}</h2>
            <p className="lead">{s.sozlukLead}</p>
          </Reveal>
          <Reveal>
            <div className="mode-grid">
              {s.modlar.map((m) => (
                <article className="mode-cell" key={m.ad}>
                  <span className="mode-abbr">{m.abbr}</span>
                  <h3>{m.ad}</h3>
                  <p>{m.p}</p>
                  <div className="mode-rules">
                    {m.kurallar.map(([cls, k, v]) => (
                      <span key={k} className={cls}>{k}: <b>{v}</b></span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <CtaBand eyebrow={s.ctaEyebrow} title={s.ctaH2} note={s.ctaNot}>
        <Btn href={DISCORD_URL} kind="light" arrow="↗">{s.ctaBtn1}</Btn>
        <Btn to="/katil" kind="ghost-light" arrow="→">{s.ctaBtn2}</Btn>
      </CtaBand>
    </Page>
  );
}
