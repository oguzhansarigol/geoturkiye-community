import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { rastgeleNokta } from "../data/turkiye-sinir.js";
import { useTheme } from "../theme.jsx";

// ============================================================
// Canlı harita: Esri World Topo (açık) / CARTO Dark Matter (koyu).
// Şehir pinleri, Türkiye sınırları içinde yanıp sönen "canlı tahmin"
// noktaları ve tıklayınca beliren "5K" (GeoGuessr'da tam puan) animasyonu.
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

const ACIK_ALTLIK = {
  url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
  opts: {
    attribution: 'Tiles © <a href="https://www.esri.com">Esri</a>',
    maxZoom: 19,
  },
};

const KOYU_ALTLIK = {
  url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  opts: {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
    subdomains: "abcd",
  },
};

function altlikSec(tema) {
  return tema === "dark" ? KOYU_ALTLIK : ACIK_ALTLIK;
}

export default function LiveMap() {
  const ref = useRef(null);
  const mapRef = useRef(null);
  const tileRef = useRef(null);
  const { theme } = useTheme();

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

    const baslangic = altlikSec(document.documentElement.dataset.theme || "light");
    tileRef.current = L.tileLayer(baslangic.url, baslangic.opts).addTo(map);
    mapRef.current = map;

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

    // "Canlı tahminler": rastgele noktalarda yanıp sönen kırmızı işaretler
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

    // Tıklanan yere sarı nokta + GeoGuessr'ın altın "5K!" rozeti
    const tikla = (e) => {
      const nokta = L.circleMarker(e.latlng, {
        radius: 5,
        color: "#ffffff",
        weight: 2,
        fillColor: "#FFB900",
        fillOpacity: 1,
        interactive: false,
      }).addTo(map);
      const rozet = L.marker(e.latlng, {
        icon: L.divIcon({ className: "fivek-wrap", html: '<img class="fivek" src="/5k.png" alt="5K">', iconSize: [0, 0] }),
        interactive: false,
      }).addTo(map);
      setTimeout(() => {
        map.removeLayer(nokta);
        map.removeLayer(rozet);
      }, 1500);
    };
    map.on("click", tikla);

    return () => {
      if (sayac) clearInterval(sayac);
      map.off("click", tikla);
      map.remove();
      mapRef.current = null;
      tileRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const secim = altlikSec(theme);
    if (tileRef.current) map.removeLayer(tileRef.current);
    tileRef.current = L.tileLayer(secim.url, secim.opts).addTo(map);
  }, [theme]);

  return <div className="livemap" ref={ref} aria-label="Türkiye haritası" />;
}
