import { createContext, useContext, useEffect, useState } from "react";

// Tema durumu: localStorage'da saklanır; yoksa sistem tercihine uyulur.
const ThemeCtx = createContext(null);

const TEMA_KEY = "ggtr-tema";
const RENK_ACIK = "#F5F2EA";
const RENK_KOYU = "#161310";

function sistemTemasi() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function baslangicTemasi() {
  if (typeof window === "undefined") return "light";
  const kayit = localStorage.getItem(TEMA_KEY);
  if (kayit === "light" || kayit === "dark") return kayit;
  return sistemTemasi();
}

function uygulaTema(tema) {
  document.documentElement.dataset.theme = tema;
  document.documentElement.style.colorScheme = tema;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", tema === "dark" ? RENK_KOYU : RENK_ACIK);
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(baslangicTemasi);

  useEffect(() => {
    uygulaTema(theme);
  }, [theme]);

  // Kullanıcı henüz seçim yapmadıysa sistem teması değişimini izle.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (localStorage.getItem(TEMA_KEY)) return;
      setThemeState(mq.matches ? "dark" : "light");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setTheme = (next) => {
    localStorage.setItem(TEMA_KEY, next);
    setThemeState(next);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeCtx.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeCtx);
}
