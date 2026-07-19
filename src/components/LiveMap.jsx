import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { rastgeleNokta } from "../data/turkiye-sinir.js";

// ============================================================
// Beyaz tonlu canlı harita (CARTO Light altlığı, API anahtarı gerekmez).
// Google Maps'in açık temasına çok yakın görünür. İleride gerçek
// Google Maps'e geçmek isterseniz: Google Cloud'dan API anahtarı alıp
// Maps JavaScript API + özel stil ile bu bileşen değiştirilebilir.
// ============================================================

const SEHIRLER = [
  { ad: "İstanbul", lat: 41.01, lon: 28.98 },
  { ad: "Ankara", lat: 39.93, lon: 32.86 },
  { ad: "İzmir", lat: 38.42, lon: 27.14 },
  { ad: "Antalya", lat: 36.89, lon: 30.71 },
  { ad: "Bursa", lat: 40.19, lon: 29.06 },
  { ad: "Bilecik", lat: 40.15, lon: 29.98 },
  { ad: "Eskişehir", lat: 39.78, lon: 30.52 },
  { ad: "Samsun", lat: 41.29, lon: 36.33 },
  { ad: "Giresun", lat: 40.91, lon: 38.39 },
  { ad: "Trabzon", lat: 41.0, lon: 39.72 },
  { ad: "Diyarbakır", lat: 37.91, lon: 40.24 },
  { ad: "Van", lat: 38.5, lon: 43.38 },
  { ad: "Kayseri", lat: 38.73, lon: 35.49 },
];

export default function LiveMap() {
  const ref = useRef(null);

  useEffect(() => {
    const map = L.map(ref.current, {
      zoomSnap: 0.25,
      minZoom: 4,
      maxZoom: 12,
      scrollWheelZoom: false,
      attributionControl: true,
      zoomControl: false,
    });
    L.control.zoom({ position: "topright" }).addTo(map);

    map.fitBounds(
      [
        [35.6, 25.6],
        [42.4, 45.0],
      ],
      { padding: [16, 16] }
    );

    // Voyager altlığı: açık tema ama yollar ve yerleşimler net görünür
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · © <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(map);

    SEHIRLER.forEach((s) => {
      L.circleMarker([s.lat, s.lon], {
        radius: 6,
        color: "#ffffff",
        weight: 2,
        fillColor: "#E30A17",
        fillOpacity: 1,
        className: "city-pin",
      })
        .addTo(map)
        .bindTooltip(s.ad, { direction: "top", offset: [0, -8] });
    });

    // "Canlı tahminler": Türkiye sınırları içinde rastgele noktalarda
    // yanıp sönen kırmızı işaretler
    const azHareket = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let sayac;
    if (!azHareket) {
      sayac = setInterval(() => {
        const adet = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < adet; i++) {
          const [lat, lon] = rastgeleNokta();
          const isaret = L.circleMarker([lat, lon], {
            radius: 2.5 + Math.random() * 3,
            stroke: false,
            fillColor: "#E30A17",
            fillOpacity: 0.9,
            className: "guess-dot",
            interactive: false,
          }).addTo(map);
          setTimeout(() => map.removeLayer(isaret), 2600);
        }
      }, 300);
    }

    return () => {
      if (sayac) clearInterval(sayac);
      map.remove();
    };
  }, []);

  return <div className="livemap" ref={ref} aria-label="Türkiye haritası" />;
}
