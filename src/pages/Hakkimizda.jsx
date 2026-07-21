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

function YouTubeIkon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.5 7.2a3.02 3.02 0 0 0-2.12-2.14C19.5 4.55 12 4.55 12 4.55s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 7.2 31.6 31.6 0 0 0 0 12c0 1.62.17 3.23.5 4.8a3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14c.33-1.57.5-3.18.5-4.8s-.17-3.23-.5-4.8zM9.6 15.3V8.7l6.27 3.3-6.27 3.3z" />
    </svg>
  );
}

function InstagramIkon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.2c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.21 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.21 8.8 2.2 12 2.2m0-2.2C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.9 5.9 0 0 0-2.13 1.38A5.9 5.9 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.38 2.13a5.9 5.9 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.13-1.38 5.9 5.9 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.13A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zm0 10.15A3.99 3.99 0 1 1 16 12a3.99 3.99 0 0 1-4 3.99zm7.85-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z" />
    </svg>
  );
}

function KickIkon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M1.333 0h8v5.333H12V2.667h2.667V0h8v8H20v2.667h-2.667v2.666H20V16h2.667v8h-8v-2.667H12v-2.666H9.333V24h-8Z" />
    </svg>
  );
}

// Gönüllü yöneticiler kartındaki anonim kişi silüeti
function Siluet() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7v1H4z" />
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

      <section className="section" id="ekip" style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal className="section-head">
            <p className="eyebrow">{s.ekipEyebrow}</p>
            <h2>{s.ekipH2}</h2>
            <p className="lead">{s.ekipLead}</p>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="kisi-grid">
              {s.ekipKisiler.map((k) => (
                <article className="kisi-cell" key={k.ad}>
                  <div className="kisi-gorsel">
                    {k.img ? (
                      <img className="kisi-foto" src={k.img} alt={k.ad} loading="lazy" width="480" height="480" />
                    ) : (
                      <span className="kisi-bas" aria-hidden="true">
                        {k.ad.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                      </span>
                    )}
                  </div>
                  <h3>{k.ad}</h3>
                  <span className="kisi-rol">{k.rol}</span>
                  <div className="kisi-sosyal">
                    {k.youtube && (
                      <a href={k.youtube} target="_blank" rel="noopener" aria-label={`${k.ad} YouTube`}><YouTubeIkon /></a>
                    )}
                    {k.instagram && (
                      <a href={k.instagram} target="_blank" rel="noopener" aria-label={`${k.ad} Instagram`}><InstagramIkon /></a>
                    )}
                    {k.kick && (
                      <a href={k.kick} target="_blank" rel="noopener" aria-label={`${k.ad} Kick`}><KickIkon /></a>
                    )}
                  </div>
                </article>
              ))}
              <article className="kisi-cell">
                <div className="kisi-gorsel">
                  <div className="kisi-yigin" aria-hidden="true">
                    <span className="ka"><Siluet /></span>
                    <span className="ka"><Siluet /></span>
                    <span className="ka"><Siluet /></span>
                    <span className="ka"><Siluet /></span>
                    <span className="ka arti">+</span>
                  </div>
                </div>
                <h3>{s.ekipCokluBaslik}</h3>
                <p>{s.ekipCokluP}</p>
              </article>
            </div>
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
                    <span className="yh-daire">
                      <img src={`/kilometre/mile${i + 1}.jpg`} alt={y.ad} loading="lazy" width="480" height="480" />
                    </span>
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

      <CtaBand eyebrow={s.ctaEyebrow} title={s.ctaH2}>
        <Btn href={DISCORD_URL} kind="light" arrow="↗">{s.ctaBtn1}</Btn>
        <Btn to="/katil" kind="ghost-light" arrow="→">{s.ctaBtn2}</Btn>
      </CtaBand>
    </Page>
  );
}
