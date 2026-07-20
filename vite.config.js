import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { profilIdCikar, geoProfilGetir } from "./api/_geoguessr.js";

// Geliştirme sunucusunda /api/geo-profil endpoint'ini taklit eder;
// üretimde aynı işi Vercel fonksiyonu (api/geo-profil.js) yapar.
function geoProfilDev() {
  return {
    name: "geo-profil-dev",
    configureServer(server) {
      server.middlewares.use("/api/geo-profil", async (req, res) => {
        const u = new URL(req.url, "http://localhost");
        const id = profilIdCikar(u.searchParams.get("url"));
        res.setHeader("content-type", "application/json; charset=utf-8");
        if (!id) {
          res.statusCode = 400;
          res.end(JSON.stringify({ hata: "gecersiz-profil" }));
          return;
        }
        try {
          res.end(JSON.stringify(await geoProfilGetir(id)));
        } catch {
          res.statusCode = 502;
          res.end(JSON.stringify({ hata: "geoguessr-erisilemedi" }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), geoProfilDev()],
});
