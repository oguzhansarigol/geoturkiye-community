import { Link } from "react-router-dom";
import { BrandMark } from "./Header.jsx";
import { SOCIALS, DISCORD_URL } from "../config.js";
import { useLang } from "../i18n.jsx";

export default function Footer() {
  const { t } = useLang();
  const f = t.footer;
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link className="brand" to="/">
              <BrandMark />
              <span className="brand-name" style={{ color: "var(--dark-text)" }}>GeoGuessr<em>Türkiye</em></span>
            </Link>
            <p>{f.aciklama}</p>
          </div>
          <div className="footer-col">
            <h4>{f.sayfalar}</h4>
            <ul>
              <li><Link to="/">{f.anaSayfa}</Link></li>
              {t.nav.linkler.map((l) => (
                <li key={l.to}><Link to={l.to}>{l.ad}</Link></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>{f.topluluk}</h4>
            <ul>
              {SOCIALS.map((s) => (
                <li key={s.ad}><a href={s.url} target="_blank" rel="noopener">{s.ad} ↗</a></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>{f.iletisim}</h4>
            <ul>
              <li><a href={DISCORD_URL} target="_blank" rel="noopener">{f.discordUzerinden} ↗</a></li>
              <li><Link to="/hakkimizda#ekip">{f.ekibimiz}</Link></li>
              <li><Link to="/katil#sss">{f.sss}</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 GeoGuessrTürkiye <span className="sep">+</span> {f.telif}</span>
          <span>{f.koordinat} <span className="sep">+</span> {f.sevgi}</span>
        </div>
      </div>
    </footer>
  );
}
