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

export default function Ticker() {
  const { lang } = useLang();
  const K = lang === "tr" ? "K" : "N";
  const D = lang === "tr" ? "D" : "E";
  const items = [...SEHIRLER, ...SEHIRLER]; // kesintisiz döngü için iki kopya
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        {items.map(([ad, lat, lon], i) => (
          <span className="ticker-item" key={i}><b>{ad}</b> {lat}°{K} · {lon}°{D}</span>
        ))}
      </div>
    </div>
  );
}
