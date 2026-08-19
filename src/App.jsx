import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { useLang } from "./i18n.jsx";
import { sesleriBaslat } from "./ses.js";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Hakkimizda from "./pages/Hakkimizda.jsx";
import Etkinlikler from "./pages/Etkinlikler.jsx";
import Kulupler from "./pages/Kulupler.jsx";
import FaydaliSiteler from "./pages/FaydaliSiteler.jsx";
import Katil from "./pages/Katil.jsx";
import Admin from "./pages/Admin.jsx";
import Davet from "./pages/Davet.jsx";
import Turnuva from "./pages/Turnuva.jsx";
import TurnuvaCanli from "./pages/TurnuvaCanli.jsx";
import { DAVET_YOLU } from "./config.js";

export default function App() {
  const location = useLocation();
  const { t } = useLang();
  // Davet sayfası tam ekran sinematik: menü ve alt bilgi gizlenir
  const davetSayfasi = location.pathname === DAVET_YOLU;

  useEffect(() => {
    if (location.hash) {
      // Sayfa geçiş animasyonu bitene kadar hedef DOM'da olmayabilir
      const zamanlayici = setTimeout(() => {
        document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 450);
      return () => clearTimeout(zamanlayici);
    }
    window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    sesleriBaslat();
  }, []);

  return (
    <>
      <a className="skip-link" href="#icerik">{t.nav.skip}</a>
      {!davetSayfasi && <Header />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/hakkimizda" element={<Hakkimizda />} />
          <Route path="/etkinlikler" element={<Etkinlikler />} />
          <Route path="/kulupler" element={<Kulupler />} />
          <Route path="/faydali-siteler" element={<FaydaliSiteler />} />
          <Route path="/katil" element={<Katil />} />
          <Route path="/admin" element={<Admin />} />
          <Route path={DAVET_YOLU} element={<Davet />} />
          <Route path="/turnuva/:kimlik" element={<Turnuva />} />
          <Route path="/turnuva/:kimlik/canli" element={<TurnuvaCanli />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </AnimatePresence>
      {!davetSayfasi && <Footer />}
    </>
  );
}
