import { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { DISCORD_URL } from "../config.js";
import { useLang } from "../i18n.jsx";
import { useTheme } from "../theme.jsx";

// Marka işareti: ay-yıldızlı konum pini (public/logo.png)
export function BrandMark() {
  return <img className="brand-mark" src="/logo.png" alt="" />;
}

// Discord logosu (resmî marka işareti)
export function DiscordIcon() {
  return (
    <svg viewBox="0 0 127.14 96.36" fill="currentColor" aria-hidden="true">
      <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
    </svg>
  );
}

function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="lang-tog" role="group" aria-label="Dil / Language">
      <button className={lang === "tr" ? "on" : ""} onClick={() => setLang("tr")}>TR</button>
      <span aria-hidden="true">/</span>
      <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
    </div>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLang();
  const koyu = theme === "dark";
  return (
    <button
      type="button"
      className="tema-tog"
      onClick={toggleTheme}
      aria-label={koyu ? t.nav.temaAcik : t.nav.temaKoyu}
      title={koyu ? t.nav.temaAcik : t.nav.temaKoyu}
    >
      {koyu ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5Z" />
        </svg>
      )}
    </button>
  );
}

const menuVariants = {
  closed: { y: "-100%", transition: { duration: 0.3, ease: "easeIn" } },
  open: { y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.06, delayChildren: 0.1 } },
};
const itemVariants = {
  closed: { opacity: 0, y: 18 },
  open: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { t } = useLang();
  const n = t.nav;

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <header className="site-header">
        <div className="container header-in">
          <Link className="brand" to="/" aria-label={n.markaAria}>
            <BrandMark />
            <span className="brand-name">GeoGuessr<em>Türkiye</em></span>
          </Link>

          <nav className="nav" aria-label="Menu">
            {n.linkler.map((l) => (
              <NavLink key={l.to} to={l.to}>{l.ad}</NavLink>
            ))}
            <a className="nav-disc" href={DISCORD_URL} target="_blank" rel="noopener" aria-label={n.discordAria}>
              <DiscordIcon />
            </a>
          </nav>

          <div className="header-right">
            <ThemeToggle />
            <LangToggle />
            <button
              className="nav-toggle"
              aria-expanded={open}
              aria-label={n.menuAria}
              onClick={() => setOpen((v) => !v)}
            >
              <span></span><span></span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.nav
            className="mnav"
            aria-label="Menu"
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            {n.linkler.map((l) => (
              <motion.div key={l.to} variants={itemVariants}>
                <NavLink to={l.to}>{l.ad}</NavLink>
              </motion.div>
            ))}
            <motion.div variants={itemVariants}>
              <a className="btn btn--red" href={DISCORD_URL} target="_blank" rel="noopener">
                {n.mnavDiscord} <span className="arr">↗</span>
              </a>
            </motion.div>
            <motion.p className="mnav-foot" variants={itemVariants}>
              {n.mnavKoordinat}
            </motion.p>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
