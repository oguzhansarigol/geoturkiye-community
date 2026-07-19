import { useMemo } from "react";
import { motion } from "motion/react";
import { NOANIM } from "../anim.js";

// ============================================================
// Türkiye haritası — gerçek enlem/boylam noktalarından üretilir.
// Projeksiyon: x = (boylam − 25.6) × 78, y = (42.6 − enlem) × 100
// Görünüşe girince kıyı çizgisi "çizilerek" belirir, pinler sırayla düşer.
// ============================================================

const LON0 = 25.6, LAT0 = 42.6, SX = 78, SY = 100;
const px = (lon) => +((lon - LON0) * SX).toFixed(1);
const py = (lat) => +((LAT0 - lat) * SY).toFixed(1);

// ANADOLU — saat yönünde, Boğaz'ın doğu yakasından başlar
const ANADOLU = [
  [41.18, 29.12], [41.16, 29.60], [41.08, 30.30], [41.10, 30.98], [41.20, 31.40],
  [41.45, 31.80], [41.62, 32.65], [41.85, 33.30], [41.97, 33.75], [42.02, 34.40],
  [42.09, 34.95], [42.02, 35.20], [41.72, 35.20], [41.73, 35.93], [41.55, 36.05],
  [41.29, 36.35], [41.37, 36.65], [41.20, 37.00], [41.05, 37.50], [41.00, 37.88],
  [40.92, 38.40], [40.95, 39.20], [41.00, 39.73], [41.03, 40.52], [41.18, 41.00],
  [41.41, 41.43], [41.52, 41.55],
  [41.50, 42.10], [41.44, 42.60], [41.22, 42.85], [41.11, 43.45], [40.62, 43.65],
  [40.25, 43.62], [40.02, 44.30], [39.72, 44.80], [39.55, 44.50], [39.35, 44.40],
  [38.90, 44.30], [38.45, 44.32], [37.98, 44.48], [37.60, 44.60], [37.15, 44.35],
  [37.10, 43.60], [37.32, 42.95], [37.10, 42.40],
  [37.05, 42.00], [37.07, 41.20], [36.90, 40.70], [36.85, 40.00], [36.72, 38.95],
  [36.88, 38.30], [36.83, 37.95], [36.72, 37.10], [36.65, 36.90], [36.58, 36.55],
  [36.25, 36.50], [35.92, 36.15], [35.90, 35.92], [36.12, 35.93], [36.35, 35.95],
  [36.58, 36.17], [36.80, 36.20], [36.87, 36.05], [36.70, 35.60], [36.57, 35.35],
  [36.70, 34.90], [36.78, 34.58], [36.60, 34.30], [36.30, 34.05], [36.10, 33.45],
  [36.02, 32.83], [36.30, 32.30], [36.54, 31.98], [36.78, 31.40], [36.85, 30.85],
  [36.88, 30.68], [36.60, 30.55], [36.35, 30.48], [36.30, 30.10], [36.20, 29.63],
  [36.25, 29.30], [36.55, 29.10], [36.62, 28.90], [36.68, 28.60], [36.78, 28.25],
  [36.72, 28.10], [36.75, 27.70], [36.68, 27.37], [36.72, 27.45], [36.85, 27.95],
  [37.00, 28.30], [37.02, 28.05], [37.03, 27.42], [37.05, 27.25], [37.20, 27.40],
  [37.35, 27.20], [37.52, 27.08], [37.68, 27.00], [37.86, 27.24], [38.05, 26.90],
  [38.20, 26.60], [38.25, 26.28], [38.40, 26.30], [38.45, 26.55],
  [38.42, 27.08], [38.55, 26.95], [38.67, 26.75],
  [38.95, 26.85], [39.10, 26.78], [39.32, 26.70],
  [39.53, 26.98], [39.50, 26.35], [39.48, 26.07], [39.70, 26.10], [39.98, 26.20],
  [40.02, 26.30], [40.18, 26.45], [40.30, 26.65], [40.38, 26.85],
  [40.38, 27.30], [40.40, 27.80], [40.38, 28.40], [40.42, 28.85],
  [40.44, 29.10], [40.60, 29.05],
  [40.70, 29.40], [40.75, 29.93], [40.82, 29.35], [40.87, 29.20], [40.96, 29.05],
];

// TRAKYA — saat yönünde, Rezovo'dan (Bulgaristan sınırı)
const TRAKYA = [
  [41.98, 28.02], [41.87, 28.02], [41.63, 28.10], [41.40, 28.35], [41.34, 28.68],
  [41.25, 28.90], [41.20, 29.05], [41.10, 29.02], [41.01, 28.98],
  [40.99, 28.70], [41.00, 28.58], [41.06, 28.25], [40.97, 27.95], [40.97, 27.51],
  [40.85, 27.40], [40.72, 27.28],
  [40.41, 26.67], [40.25, 26.55], [40.14, 26.40], [40.04, 26.18],
  [40.18, 26.20], [40.32, 26.25], [40.44, 26.55], [40.55, 26.78],
  [40.62, 26.55], [40.73, 26.06], [40.95, 26.30], [41.15, 26.30], [41.32, 26.60],
  [41.53, 26.60], [41.66, 26.36],
  [41.75, 26.60], [41.83, 26.95], [41.95, 27.25], [41.90, 27.55], [41.97, 27.83],
];

const SEHIRLER = [
  { ad: "İSTANBUL",   lat: 41.01, lon: 28.98, dx: -20, dy: -24, a: "end" },
  { ad: "ANKARA",     lat: 39.93, lon: 32.86, dx: 24,  dy: 8,   a: "start" },
  { ad: "İZMİR",      lat: 38.42, lon: 27.14, dx: 24,  dy: 34,  a: "start" },
  { ad: "ANTALYA",    lat: 36.89, lon: 30.71, dx: 16,  dy: 40,  a: "start" },
  { ad: "TRABZON",    lat: 41.00, lon: 39.72, dx: 0,   dy: -26, a: "middle" },
  { ad: "DİYARBAKIR", lat: 37.91, lon: 40.24, dx: 24,  dy: 8,   a: "start" },
  { ad: "VAN",        lat: 38.50, lon: 43.38, dx: -24, dy: 40,  a: "end" },
  { ad: "KAYSERİ",    lat: 38.73, lon: 35.49, dx: 24,  dy: 8,   a: "start" },
];

// Catmull-Rom → kübik bezier: kıyı çizgisine doğal, akıcı bir görünüm verir
function smoothClosed(latlon) {
  const p = latlon.map(([la, lo]) => [px(lo), py(la)]);
  const n = p.length;
  let d = `M ${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
    const c1x = (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1);
    const c1y = (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1);
    const c2x = (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1);
    const c2y = (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1);
    d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2[0]} ${p2[1]}`;
  }
  return d + " Z";
}

const viewport = { once: true, margin: "0px 0px -80px 0px" };

function LandPath({ d, delay }) {
  return (
    <motion.path
      className="land-shape"
      d={d}
      initial={NOANIM ? false : { pathLength: 0, fillOpacity: 0 }}
      whileInView={{ pathLength: 1, fillOpacity: 1 }}
      viewport={viewport}
      transition={{
        pathLength: { duration: 1.7, ease: "easeInOut", delay },
        fillOpacity: { duration: 0.7, delay: delay + 1.4 },
      }}
    />
  );
}

function Pin({ sehir, index }) {
  const x = px(sehir.lon), y = py(sehir.lat);
  const delay = 1.7 + index * 0.09;
  const spring = { type: "spring", stiffness: 300, damping: 17, delay };
  const origin = { transformBox: "fill-box", transformOrigin: "center" };
  return (
    <g className="pin" transform={`translate(${x} ${y})`}>
      <motion.circle
        className="pin-ring" r="16"
        initial={NOANIM ? { opacity: 0.45 } : { scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 0.45 }}
        viewport={viewport}
        transition={spring}
        style={origin}
      />
      <motion.circle
        className="pin-dot" r="7"
        initial={NOANIM ? false : { scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={viewport}
        transition={spring}
        style={origin}
      />
      <motion.text
        className="pin-label"
        x={sehir.dx} y={sehir.dy} textAnchor={sehir.a}
        initial={NOANIM ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={viewport}
        transition={{ duration: 0.45, delay: delay + 0.12 }}
      >
        {sehir.ad}
      </motion.text>
    </g>
  );
}

export default function TurkeyMap() {
  const anadoluD = useMemo(() => smoothClosed(ANADOLU), []);
  const trakyaD = useMemo(() => smoothClosed(TRAKYA), []);

  const gratV = [];
  for (let lon = 26; lon <= 44; lon += 2) gratV.push(px(lon));
  const gratH = [];
  for (let lat = 36; lat <= 42; lat += 2) gratH.push(py(lat));

  return (
    <svg
      className="tr-map"
      viewBox="0 0 1520 700"
      role="img"
      aria-label="Türkiye haritası — topluluk şehirleri"
      preserveAspectRatio="xMidYMid meet"
    >
      <motion.g
        className="map-grat"
        initial={NOANIM ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={viewport}
        transition={{ duration: 0.9 }}
      >
        {gratV.map((x) => <line key={`v${x}`} x1={x} y1="0" x2={x} y2="700" />)}
        {gratH.map((y) => <line key={`h${y}`} x1="0" y1={y} x2="1520" y2={y} />)}
      </motion.g>

      <motion.g
        className="map-grat-labels"
        initial={NOANIM ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={viewport}
        transition={{ duration: 0.9, delay: 0.3 }}
      >
        {[28, 32, 36, 40, 44].map((lon) => (
          <text key={lon} x={px(lon) + 8} y="692">{lon}°D</text>
        ))}
        {[36, 38, 40, 42].map((lat) => (
          <text key={lat} x="10" y={py(lat) - 8}>{lat}°K</text>
        ))}
      </motion.g>

      <g className="map-land">
        <LandPath d={anadoluD} delay={0.15} />
        <LandPath d={trakyaD} delay={0.45} />
      </g>

      <g className="map-pins">
        {SEHIRLER.map((s, i) => <Pin key={s.ad} sehir={s} index={i} />)}
      </g>
    </svg>
  );
}
