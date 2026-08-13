import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { NOANIM } from "../anim.js";
import AnimatedTopo from "../components/AnimatedTopo.jsx";
import CopAdam from "../components/CopAdam.jsx";
import { DAVET_EPOSTA, DAVET_DISCORD, TURNUVA_YAYIN_URL } from "../config.js";

// ============================================================
// Davetli turnuva davet sayfası (/davet/… — sadece linki bilenler).
// Header/Footer olmadan tam ekran sinematik sahne: sayfa yüklenince
// zarfın kapağı kendiliğinden açılır, davetiye kartı süzülerek
// yükselir; ince bir ışık halkası ve yumuşak bir açılış sesi eşlik
// eder. Arama motorlarına kapalı (noindex) ve menülerden erişilemez.
// ============================================================

const HARITA_URL = "https://www.geoguessr.com/maps/6089bfcff6a0770001f645dd";
// Sayfa yüklendikten ne kadar sonra kapak açılıp kart yükselecek
const ACILIS_GECIKME_MS = 550;

// Zarif açılış sesi: dosya yerine Web Audio ile sentezlenir — yumuşak
// bir esinti kabarması ve nazik çan tınıları. Tarayıcı etkileşimsiz
// sesi engellerse ilk tıklama/tuşta bir kez denenir; temizleme
// fonksiyonu döner (sayfadan çıkılırsa dinleyiciler ve ses kapanır).
function zarifSes() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return () => {};
  let ctx;
  try {
    ctx = new Ctx();
  } catch {
    return () => {};
  }

  let calindi = false;
  const cal = () => {
    if (calindi || ctx.state !== "running") return;
    calindi = true;
    try {
      const t = ctx.currentTime + 0.05;
      const ana = ctx.createGain();
      ana.gain.value = 0.3;
      ana.connect(ctx.destination);

      // Yumuşak esinti: bant geçiren filtreyle şekillenen gürültü
      const sure = 1.6;
      const tampon = ctx.createBuffer(1, ctx.sampleRate * sure, ctx.sampleRate);
      const veri = tampon.getChannelData(0);
      for (let i = 0; i < veri.length; i++) veri[i] = Math.random() * 2 - 1;
      const esinti = ctx.createBufferSource();
      esinti.buffer = tampon;
      const filtre = ctx.createBiquadFilter();
      filtre.type = "bandpass";
      filtre.Q.value = 0.8;
      filtre.frequency.setValueAtTime(380, t);
      filtre.frequency.exponentialRampToValueAtTime(1600, t + 1.1);
      const eGain = ctx.createGain();
      eGain.gain.setValueAtTime(0.0001, t);
      eGain.gain.exponentialRampToValueAtTime(0.1, t + 0.55);
      eGain.gain.exponentialRampToValueAtTime(0.0001, t + sure);
      esinti.connect(filtre).connect(eGain).connect(ana);
      esinti.start(t);

      // Nazik çanlar: Do majör, sırayla beliren uzun sönümlü sinüsler
      [523.25, 659.25, 783.99, 1046.5].forEach((frekans, i) => {
        const o = ctx.createOscillator();
        o.type = "sine";
        o.frequency.value = frekans;
        const g = ctx.createGain();
        const b = t + 0.35 + i * 0.14;
        g.gain.setValueAtTime(0.0001, b);
        g.gain.exponentialRampToValueAtTime(0.06, b + 0.04);
        g.gain.exponentialRampToValueAtTime(0.0001, b + 1.9);
        o.connect(g).connect(ana);
        o.start(b);
        o.stop(b + 2);
      });

      // Ses bitince bağlamı kapat (sekmede kaynak açık kalmasın)
      setTimeout(() => ctx.close().catch(() => {}), 3800);
    } catch {
      /* ses çalınamazsa davetiye sessizce açılır */
    }
  };

  const kaldir = () => {
    window.removeEventListener("pointerdown", dene);
    window.removeEventListener("keydown", dene);
  };
  const dene = () => {
    kaldir();
    ctx.resume().then(cal).catch(() => {});
  };

  // Önce otomatik çalmayı dene; engellenirse ilk etkileşimi bekle
  ctx.resume().then(() => {
    if (ctx.state === "running") {
      kaldir();
      cal();
    }
  }).catch(() => {});
  window.addEventListener("pointerdown", dene);
  window.addEventListener("keydown", dene);

  return () => {
    kaldir();
    ctx.close().catch(() => {});
  };
}

function YouTubeIkon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z" />
    </svg>
  );
}

// Single elimination için mini eşleşme ağacı simgesi
function BraketIkon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 5.5h7v13H3" />
      <path d="M10 12h11" />
    </svg>
  );
}

// Sayfaya dağılmış minik ışıltılar: [sol %, üst %, boyut px, gecikme s]
const KIVILCIMLAR = [
  [7, 14, 3, 0], [16, 62, 2, 1.3], [11, 38, 2.5, 2.6], [22, 22, 2, 3.4],
  [30, 74, 3, 0.8], [41, 10, 2, 2.1], [58, 8, 2.5, 1.7], [69, 20, 2, 3.9],
  [78, 40, 3, 0.4], [86, 15, 2, 2.9], [90, 58, 2.5, 1.1], [82, 76, 2, 3.1],
  [64, 84, 2.5, 2.3], [37, 88, 2, 1.9], [93, 32, 2, 0.6], [5, 80, 2.5, 3.7],
];

const DETAYLAR = [
  { deger: "32", etiket: "Oyuncu" },
  { ikon: <YouTubeIkon />, etiket: "Canlı", link: true },
  { ikon: <BraketIkon />, etiket: "Single Elimination" },
  { deger: "NM", etiket: "No Move Formatında" },
];

// Ana sayfadaki koordinat bandıyla aynı yürüyüş sistemi (.yuruyen):
// dur: geçiş süresi (s) · gec: negatif gecikmeyle başlangıç konumu ·
// boy: ölçek · adim: adım temposu (s) · geri: sağdan sola.
const YURUYENLER = [
  { dur: 30, gec: 0, boy: 1.7, adim: 0.5 },
  { dur: 30, gec: -1.4, boy: 1.5, adim: 0.45 },
  { dur: 36, gec: -5, boy: 1.9, adim: 0.55 },
  { dur: 26, gec: -8, boy: 1.6, adim: 0.46 },
  { dur: 34, gec: -12, boy: 1.4, adim: 0.42, geri: true },
  { dur: 30, gec: -15, boy: 1.8, adim: 0.5 },
  { dur: 40, gec: -18, boy: 1.5, adim: 0.48 },
  { dur: 28, gec: -21, boy: 1.7, adim: 0.5, geri: true },
  { dur: 33, gec: -25, boy: 1.6, adim: 0.47 },
  { dur: 38, gec: -30, boy: 1.4, adim: 0.44 },
  { dur: 30, gec: -27, boy: 1.9, adim: 0.52 },
  { dur: 36, gec: -33, boy: 1.5, adim: 0.46, geri: true },
];

export default function Davet() {
  const [kopyalandi, setKopyalandi] = useState(false);
  const [acildi, setAcildi] = useState(NOANIM); // kapak açık mı
  const [isilti, setIsilti] = useState(false); // halka + süzülen ışıltılar

  // Açılış koreografisi: kısa bir nefesin ardından kapak açılır,
  // kart yükselir, ışıltılar belirir ve yumuşak açılış sesi çalar.
  useEffect(() => {
    if (NOANIM) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setAcildi(true);
      return;
    }
    const sesiTemizle = zarifSes();
    const t1 = setTimeout(() => {
      setAcildi(true);
      setIsilti(true);
    }, ACILIS_GECIKME_MS);
    const t2 = setTimeout(() => setIsilti(false), ACILIS_GECIKME_MS + 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      sesiTemizle();
    };
  }, []);

  // Fare zarfın üzerinde gezerken hafif 3B eğilme
  function fareHareket(e) {
    if (NOANIM) return;
    const kutu = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - kutu.left) / kutu.width - 0.5;
    const y = (e.clientY - kutu.top) / kutu.height - 0.5;
    e.currentTarget.style.setProperty("--rx", `${(-y * 7).toFixed(2)}deg`);
    e.currentTarget.style.setProperty("--ry", `${(x * 9).toFixed(2)}deg`);
  }
  function fareCikis(e) {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  }

  // Başlık + noindex (davet sayfası arama sonuçlarına girmesin)
  useEffect(() => {
    const eskiBaslik = document.title;
    document.title = "Davetlisiniz · GeoGuessr Türkiye";
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    document.head.appendChild(robots);
    return () => {
      document.title = eskiBaslik;
      robots.remove();
    };
  }, []);

  async function discordKopyala() {
    try {
      await navigator.clipboard.writeText(DAVET_DISCORD);
      setKopyalandi(true);
      setTimeout(() => setKopyalandi(false), 2200);
    } catch {
      /* pano erişimi yoksa kullanıcı adı zaten ekranda yazılı */
    }
  }

  return (
    <motion.main
      id="icerik"
      className="davet"
      initial={NOANIM ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Link to="/" className="davet-geri">← Ana Sayfa</Link>
      <div className="davet-topo" aria-hidden="true"><AnimatedTopo /></div>
      <div className="davet-isik davet-isik--a" aria-hidden="true" />
      <div className="davet-isik davet-isik--b" aria-hidden="true" />
      <div className="davet-kivilcimlar" aria-hidden="true">
        {KIVILCIMLAR.map(([x, y, boyut, gecikme], i) => (
          <span
            key={i}
            className="davet-kivilcim"
            style={{ left: `${x}%`, top: `${y}%`, width: boyut, height: boyut, animationDelay: `${gecikme}s` }}
          />
        ))}
      </div>

      <section className="davet-sahne">
        <p className="davet-marka">GeoGuessr Türkiye</p>

        {/* Zarf + yükselen davetiye kartı */}
        <div
          className={"davet-zarf" + (acildi ? "" : " davet-zarf--kapali")}
          onMouseMove={fareHareket}
          onMouseLeave={fareCikis}
        >
          <div className="davet-parilti" aria-hidden="true" />
          <div className="davet-zarf-arka" aria-hidden="true" />
          <div className="davet-kart">
            <span className="davet-kose davet-kose--sol" aria-hidden="true" />
            <span className="davet-kose davet-kose--sag" aria-hidden="true" />
            {[...Array(9)].map((_, i) => (
              <span
                key={i}
                className="davet-yildiz"
                style={{
                  left: `${7 + i * 10.5}%`,
                  top: `${10 + ((i * 37) % 52)}%`,
                  animationDelay: `${i * 0.42}s`,
                }}
                aria-hidden="true"
              />
            ))}
            <p className="davet-kart-ust">29 Ağustos 2026 · 19.00</p>
            <h1>GeoGuessr Türkiye Topluluk Turnuvası</h1>
            <p className="davet-kart-metin">turnuvasına davetlisiniz.</p>
          </div>
          <div className="davet-zarf-on" aria-hidden="true" />

          {/* Açılış anı: yayılan ışık halkaları + süzülen ışıltılar */}
          {isilti && (
            <div className="davet-isilti" aria-hidden="true">
              <span className="davet-halka" />
              <span className="davet-halka davet-halka--gec" />
              {[16, 30, 44, 58, 72, 86].map((x, i) => (
                <span
                  key={x}
                  className="davet-suzulen"
                  style={{ "--x": `${x}%`, "--gec": `${0.2 + i * 0.18}s` }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="davet-bilgi">
          <p>
            Harita:{" "}
            <a href={HARITA_URL} target="_blank" rel="noopener">An Arbitrary World ↗</a>
          </p>
          <p>Turnuva akşam saat 19.00'da başlayacaktır.</p>
        </div>

        {/* Turnuva künyesi */}
        <div className="davet-detaylar">
          {DETAYLAR.map((d) => {
            const icerik = (
              <>
                {d.ikon ? (
                  <span className="davet-detay-deger davet-detay-ikon">{d.ikon}</span>
                ) : (
                  <span className="davet-detay-deger">{d.deger}</span>
                )}
                <span className="davet-detay-etiket">{d.etiket}</span>
              </>
            );
            return d.link ? (
              <a
                className="davet-detay davet-detay--canli"
                key={d.etiket}
                href={TURNUVA_YAYIN_URL}
                target="_blank"
                rel="noopener"
              >
                {icerik}
              </a>
            ) : (
              <div className="davet-detay" key={d.etiket}>{icerik}</div>
            );
          })}
        </div>
        <p className="davet-kura-not">
          Kura, güç sıralamasına göre ayrılmış 4 torbadan çekilecek. Her bölgeye her
          torbadan bir oyuncu düşer; ilk turda Torba 1 ile Torba 4, Torba 2 ile Torba 3 eşleşir.
        </p>
        <p className="davet-kura-not davet-kura-not--italik">
          Maç sırasında Discord üzerinden hakemlere ekran paylaşılacaktır.
        </p>

        {/* Katılım bildirimi */}
        <div className="davet-rsvp">
          <p className="davet-rsvp-soru">Katılıp katılamayacağınızı bize bildirin:</p>
          <div className="davet-rsvp-btnler">
            <a className="davet-btn davet-btn--dolu" href={`mailto:${DAVET_EPOSTA}?subject=${encodeURIComponent("29 Ağustos 2026 Turnuva Daveti")}`}>
              E-posta Gönder <span className="davet-btn-alt">{DAVET_EPOSTA}</span>
            </a>
            <button type="button" className="davet-btn" onClick={discordKopyala}>
              {kopyalandi ? "Kopyalandı ✓" : "Discord"}
              <span className="davet-btn-alt">@{DAVET_DISCORD}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Sahnenin altında yürüyen çöp adamlar (ana sayfadakiyle aynı) */}
      <div className="davet-zemin" aria-hidden="true">
        {YURUYENLER.map((y, i) => (
          <span
            key={i}
            className={y.geri ? "yuruyen geri" : "yuruyen"}
            style={{ "--dur": `${y.dur}s`, "--gec": `${y.gec}s`, "--boy": y.boy, "--adim": `${y.adim}s` }}
          >
            <CopAdam />
          </span>
        ))}
      </div>

      <p className="davet-imza">geoturkiye.community · Bu sayfa yalnızca davetliler içindir</p>
    </motion.main>
  );
}
