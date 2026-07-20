import { Fragment } from "react";
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

// Kilometre taşları: duraklar arasındaki kıvrımlı kesikli rota parçası
function YolKivrim({ ters }) {
  return (
    <svg className="yh-kivrim" viewBox="0 0 300 100" preserveAspectRatio="none" aria-hidden="true">
      <path
        d={ters ? "M240 2 C 240 58, 60 42, 60 98" : "M60 2 C 60 58, 240 42, 240 98"}
        fill="none" stroke="currentColor" strokeWidth="2.5"
        strokeDasharray="7 8" strokeLinecap="round"
      />
    </svg>
  );
}

// Durak çizimleri (şimdilik yer tutucu; ileride fotoğrafla değişebilir)
const YH_IKONLAR = [
  // 01 — Kuruluş: konuşma balonları + pin
  <svg viewBox="0 0 96 96" key="k">
    <g fill="none" stroke="var(--ink)" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round">
      <path d="M18 26h38a6 6 0 0 1 6 6v16a6 6 0 0 1-6 6H36l-10 9v-9h-8a6 6 0 0 1-6-6V32a6 6 0 0 1 6-6Z" />
      <path d="M70 42h8a6 6 0 0 1 6 6v12a6 6 0 0 1-6 6h-4v8l-9-8h-9" />
    </g>
    <circle cx="30" cy="40" r="3.2" fill="var(--red)" />
    <circle cx="40" cy="40" r="3.2" fill="var(--red)" />
    <circle cx="50" cy="40" r="3.2" fill="var(--red)" />
  </svg>,
  // 02 — Turnuvalar: kupa
  <svg viewBox="0 0 96 96" key="t">
    <g fill="none" stroke="var(--ink)" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round">
      <path d="M34 20h28v14a14 14 0 0 1-28 0Z" />
      <path d="M34 24h-9a2 2 0 0 0-2 2c0 8 4 13 11 14M62 24h9a2 2 0 0 1 2 2c0 8-4 13-11 14" />
      <path d="M48 48v10M40 66h16M36 76h24" />
    </g>
    <path d="m48 26 2.3 4.7 5.2.7-3.8 3.6.9 5.1-4.6-2.4-4.6 2.4.9-5.1-3.8-3.6 5.2-.7Z" fill="var(--red)" />
  </svg>,
  // 03 — Büyüme: katlanmış harita + rota
  <svg viewBox="0 0 96 96" key="h">
    <g fill="none" stroke="var(--ink)" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round">
      <path d="M16 28 38 20l20 8 22-8v48l-22 8-20-8-22 8Z" />
      <path d="M38 20v48M58 28v48" />
    </g>
    <path d="M24 56c8-10 16 2 24-8s14-2 22-10" fill="none" stroke="var(--red)" strokeWidth="3" strokeDasharray="5 5" strokeLinecap="round" />
    <circle cx="24" cy="56" r="3.4" fill="var(--red)" />
    <circle cx="70" cy="38" r="3.4" fill="var(--red)" />
  </svg>,
  // 04 — Yayında: tarayıcı penceresi + pin
  <svg viewBox="0 0 96 96" key="w">
    <g fill="none" stroke="var(--ink)" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round">
      <rect x="14" y="20" width="68" height="56" rx="6" />
      <path d="M14 34h68" />
    </g>
    <circle cx="24" cy="27" r="2.6" fill="var(--red)" />
    <circle cx="33" cy="27" r="2.6" fill="var(--ink)" opacity=".55" />
    <circle cx="42" cy="27" r="2.6" fill="var(--ink)" opacity=".3" />
    <path d="M48 42c8 0 14 6 14 13 0 9-14 19-14 19S34 64 34 55c0-7 6-13 14-13Z" fill="none" stroke="var(--red)" strokeWidth="3.4" strokeLinejoin="round" />
    <circle cx="48" cy="55" r="4" fill="var(--red)" />
  </svg>,
];

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

      <section className="section" style={{ paddingTop: 48 }}>
        <div className="container twocol twocol-ortali">
          <Reveal className="sticky-side">
            <p className="eyebrow">{s.yolEyebrow}</p>
            <h2 className="side-h2">{s.yolH2}</h2>
          </Reveal>
          <div className="yol-serit">
            {s.yolculuk.map((y, i) => (
              <Fragment key={y.ad}>
                {i > 0 && <YolKivrim ters={i % 2 === 1} />}
                <Reveal className={`yh-durak${i % 2 === 1 ? " ters" : ""}`} delay={0.05}>
                  <div className="yh-gorsel">
                    <span className="yh-daire">{YH_IKONLAR[i]}</span>
                    <span className="yh-etiket">{y.etiket} ·</span>
                  </div>
                  <div className="yh-metin">
                    <span className="yh-tarih">{y.tarih}</span>
                    <h3>{y.ad}</h3>
                    <p>{y.p}</p>
                  </div>
                </Reveal>
              </Fragment>
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
