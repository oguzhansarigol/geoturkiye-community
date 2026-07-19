import { createContext, useContext, useEffect, useState } from "react";
import { METIN } from "./metinler.jsx";

// Dil durumu: localStorage'da saklanır; URL'ye ?dil=en eklenerek de seçilebilir.
const LangCtx = createContext(null);

function baslangicDili() {
  if (typeof window === "undefined") return "tr";
  const url = new URLSearchParams(window.location.search).get("dil");
  if (url === "en" || url === "tr") return url;
  const kayit = localStorage.getItem("ggtr-dil");
  return kayit === "en" ? "en" : "tr";
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(baslangicDili);

  useEffect(() => {
    localStorage.setItem("ggtr-dil", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LangCtx.Provider value={{ lang, setLang, t: METIN[lang] }}>
      {children}
    </LangCtx.Provider>
  );
}

export function useLang() {
  return useContext(LangCtx);
}
