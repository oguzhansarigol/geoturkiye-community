import { useState } from "react";
import Reveal from "./Reveal.jsx";
import Btn from "./Btn.jsx";
import { supabase } from "../supabase.js";
import { DISCORD_URL } from "../config.js";
import { useLang } from "../i18n.jsx";

// Kulüpler sayfasındaki başvuru formu. Supabase yapılandırılmamışsa görünmez.
export default function KulupBasvuru({ kulupler }) {
  const { t } = useLang();
  const s = t.kulupler;
  const [form, setForm] = useState({ kulup: kulupler[0]?.ad || "", discord: "", profil: "", adSoyad: "" });
  const [durum, setDurum] = useState("bos"); // bos | gonderiliyor | basarili
  const [hata, setHata] = useState("");

  if (!supabase) return null;

  function guncelle(alan) {
    return (e) => setForm((f) => ({ ...f, [alan]: e.target.value }));
  }

  async function gonder(e) {
    e.preventDefault();
    setHata("");
    if (!form.discord.trim() || !form.profil.trim()) {
      setHata(s.fZorunlu);
      return;
    }
    setDurum("gonderiliyor");
    const { error } = await supabase.from("kulup_basvurulari").insert({
      kulup: form.kulup,
      discord_kullanici: form.discord.trim(),
      oyun_profili: form.profil.trim(),
      ad_soyad: form.adSoyad.trim(),
    });
    if (error) {
      setDurum("bos");
      setHata(error.code === "23505" ? s.fHataTekrar : s.fHataGenel);
      return;
    }
    setDurum("basarili");
  }

  return (
    <section className="section" id="kulup-basvuru" style={{ paddingTop: 0, scrollMarginTop: 90 }}>
      <div className="container">
        <Reveal className="section-head">
          <p className="eyebrow">{s.formEyebrow}</p>
          <h2>{s.formH2}</h2>
        </Reveal>
        <Reveal>
          <div className="t-kart">
            <p className="t-kart-aciklama" style={{ marginTop: 0 }}>{s.formLead}</p>
            {durum === "basarili" ? (
              <div className="form-basari" role="status">
                <p><b>✓</b> {s.fBasari}</p>
                <Btn href={DISCORD_URL} kind="red" arrow="↗">Discord</Btn>
              </div>
            ) : (
              <form className="t-form t-form-dikey" onSubmit={gonder}>
                <div className="t-form-grid">
                  <label>
                    <span>{s.fKulup} *</span>
                    <select value={form.kulup} onChange={guncelle("kulup")}>
                      {kulupler.map((k) => <option key={k.ad} value={k.ad}>{k.ad}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>{s.fDiscord} *</span>
                    <input
                      type="text" required maxLength={40}
                      placeholder={s.fDiscordPh}
                      value={form.discord} onChange={guncelle("discord")}
                    />
                  </label>
                  <label>
                    <span>{s.fProfil} *</span>
                    <input
                      type="url" required maxLength={300}
                      placeholder={s.fProfilPh}
                      value={form.profil} onChange={guncelle("profil")}
                    />
                  </label>
                  <label>
                    <span>{s.fAdSoyad}</span>
                    <input type="text" maxLength={100} value={form.adSoyad} onChange={guncelle("adSoyad")} />
                  </label>
                </div>
                {hata && <p className="form-hata" role="alert">{hata}</p>}
                <Btn type="submit" kind="ink" disabled={durum === "gonderiliyor"}>
                  {durum === "gonderiliyor" ? s.fGonderiliyor : s.fGonder}
                </Btn>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
