import { createContext, useContext, useEffect, useState } from "react";

// Tema durumu: localStorage'da saklanır; kayıt yoksa varsayılan açık temadır.
const ThemeCtx = createContext(null);

const TEMA_KEY = "ggtr-tema";
const RENK_ACIK = "#F5F2EA";
const RENK_KOYU = "#161310";

function baslangicTemasi() {
  if (typeof window === "undefined") return "light";
  const kayit = localStorage.getItem(TEMA_KEY);
  if (kayit === "light" || kayit === "dark") return kayit;
  return "light";
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
