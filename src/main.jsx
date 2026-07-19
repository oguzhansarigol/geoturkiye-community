import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MotionConfig } from "motion/react";
import { LangProvider } from "./i18n.jsx";
import App from "./App.jsx";
import "./styles/global.css";

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
