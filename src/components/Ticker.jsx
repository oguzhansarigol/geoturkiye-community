import { useLang } from "../i18n.jsx";

const SEHIRLER = [
  ["İSTANBUL", "41.01", "28.98"],
  ["ANKARA", "39.93", "32.86"],
  ["İZMİR", "38.42", "27.14"],
  ["TRABZON", "41.00", "39.72"],
  ["ANTALYA", "36.89", "30.71"],
  ["DİYARBAKIR", "37.91", "40.24"],
  ["VAN", "38.50", "43.38"],
  ["SAMSUN", "41.29", "36.33"],
  ["ESKİŞEHİR", "39.78", "30.52"],
  ["GAZİANTEP", "37.07", "37.38"],
  ["KARS", "40.61", "43.10"],
  ["EDİRNE", "41.68", "26.56"],
];

// Bandın üst çizgisinde yürüyen kalabalık.
// dur: çizgiyi kat etme süresi (s) · gec: negatif gecikmeyle başlangıç
// konumu · boy: ölçek · adim: adım temposu (s) · geri: sağdan sola.
// Aynı "dur" ve yakın "gec" değerleri grup hâlinde yürüyenleri oluşturur.
const YURUYENLER = [
  { dur: 40, gec: 0, boy: 1.0, adim: 0.5 },
  { dur: 40, gec: -1.2, boy: 0.85, adim: 0.44 },
  { dur: 40, gec: -2.2, boy: 1.1, adim: 0.54 },
  { dur: 52, gec: -6, boy: 0.9, adim: 0.48 },
  { dur: 36, gec: -7, boy: 1.05, adim: 0.46 },
  { dur: 48, gec: -12, boy: 0.8, adim: 0.42, geri: true },
  { dur: 40, gec: -13, boy: 1.0, adim: 0.5 },
  { dur: 44, gec: -16.5, boy: 0.95, adim: 0.47 },
  { dur: 44, gec: -17.6, boy: 1.1, adim: 0.52 },
  { dur: 56, gec: -26, boy: 0.85, adim: 0.45, geri: true },
  { dur: 38, gec: -19, boy: 1.0, adim: 0.5 },
  { dur: 42, gec: -23, boy: 0.9, adim: 0.44 },
  { dur: 50, gec: -30, boy: 1.05, adim: 0.55, geri: true },
  { dur: 40, gec: -26, boy: 1.0, adim: 0.48 },
  { dur: 40, gec: -27.1, boy: 0.8, adim: 0.42 },
  { dur: 46, gec: -34, boy: 1.1, adim: 0.53 },
  { dur: 36, gec: -29, boy: 0.9, adim: 0.46, geri: true },
  { dur: 44, gec: -38, boy: 1.0, adim: 0.5 },
  { dur: 40, gec: -37, boy: 0.95, adim: 0.47 },
  { dur: 48, gec: -47, boy: 0.85, adim: 0.44, geri: true },
];

function CopAdam() {
  return (
    <svg viewBox="0 0 10 13" width="9.2" height="12">
      <circle cx="5" cy="2" r="1.7" fill="currentColor" />
      <line x1="5" y1="3.7" x2="5" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line className="ca-kol on" x1="5" y1="4.7" x2="5" y2="7.9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <line className="ca-kol arka" x1="5" y1="4.7" x2="5" y2="7.9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <line className="ca-bacak on" x1="5" y1="8" x2="5" y2="12.7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <line className="ca-bacak arka" x1="5" y1="8" x2="5" y2="12.7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

export default function Ticker() {
  const { lang } = useLang();
  const K = lang === "tr" ? "K" : "N";
  const D = lang === "tr" ? "D" : "E";
  const items = [...SEHIRLER, ...SEHIRLER]; // kesintisiz döngü için iki kopya
  return (
    <div className="ticker-wrap" aria-hidden="true">
      <div className="ticker-walkers">
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
      <div className="ticker">
        <div className="ticker-track">
          {items.map(([ad, lat, lon], i) => (
            <span className="ticker-item" key={i}><b>{ad}</b> {lat}°{K} · {lon}°{D}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
