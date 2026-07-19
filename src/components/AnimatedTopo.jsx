// Hero arka planı: yavaşça sürüklenen, kesikli çizgileri akan
// eş yükselti eğrileri. Salt dekoratif; tıklamaları engellemez.

function ring(cx, cy, base, f1, f2, p1, p2, n = 40) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = base * (1 + f1 * Math.sin(3 * a + p1) + f2 * Math.sin(5 * a + p2) + 0.05 * Math.sin(7 * a + p1 * 2));
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a) * 0.82]);
  }
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], q1 = pts[i], q2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += ` C ${(q1[0] + (q2[0] - p0[0]) / 6).toFixed(1)} ${(q1[1] + (q2[1] - p0[1]) / 6).toFixed(1)} ${(q2[0] - (p3[0] - q1[0]) / 6).toFixed(1)} ${(q2[1] - (p3[1] - q1[1]) / 6).toFixed(1)} ${q2[0].toFixed(1)} ${q2[1].toFixed(1)}`;
  }
  return d + " Z";
}

function tepe(cx, cy, adet, taban, adim, s1, s2) {
  const yollar = [];
  for (let k = 0; k < adet; k++) {
    yollar.push({
      d: ring(cx, cy, taban + k * adim, 0.13 + k * 0.004, 0.09, s1 + k * 0.33, s2 + k * 0.24),
      akis: k % 3 === 1, // her üç halkadan biri "akan" kesikli çizgi
    });
  }
  return yollar;
}

const TEPE_A = tepe(1150, 240, 10, 70, 54, 0.8, 2.1);
const TEPE_B = tepe(240, 860, 7, 55, 50, 2.4, 0.6);

export default function AnimatedTopo() {
  return (
    <div className="topo-live" aria-hidden="true">
      <svg viewBox="0 0 1500 1000" preserveAspectRatio="xMidYMid slice">
        <g className="hillA">
          {TEPE_A.map((y, i) => (
            <path key={i} d={y.d} className={y.akis ? "flow" : undefined} />
          ))}
        </g>
        <g className="hillB">
          {TEPE_B.map((y, i) => (
            <path key={i} d={y.d} className={y.akis ? "flow" : undefined} />
          ))}
        </g>
      </svg>
    </div>
  );
}
