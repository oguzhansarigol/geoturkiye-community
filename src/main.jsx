import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MotionConfig } from "motion/react";
import { LangProvider } from "./i18n.jsx";
import App from "./App.jsx";
import "./styles/global.css";

// Kayıtlı tema tercihini ilk boyamadan önce uygula (varsayılan: açık)
try {
  if (localStorage.getItem("ggtr-tema") === "koyu") {
    document.documentElement.dataset.tema = "koyu";
  }
} catch { /* localStorage kapalıysa açık temayla devam */ }

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <LangProvider>
        <MotionConfig reducedMotion="user">
          <App />
        </MotionConfig>
      </LangProvider>
    </BrowserRouter>
  </StrictMode>
);
