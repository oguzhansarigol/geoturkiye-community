import { useEffect, useState } from "react";
import Reveal from "./Reveal.jsx";
import Btn from "./Btn.jsx";
import { supabase } from "../supabase.js";
import { DISCORD_URL } from "../config.js";
import { useLang } from "../i18n.jsx";

// Tek bir turnuva kartı + açılır başvuru formu
function TurnuvaKart({ turnuva, sayi }) {
  const { t } = useLang();
  const s = t.etkinlikler;
  const [acik, setAcik] = useState(false);
  const [form, setForm] = useState({ discord: "", profil: "", adSoyad: "" });
  const [durum, setDurum] = useState("bos"); // bos | gonderiliyor | basarili
  const [hata, setHata] = useState("");

  const dolu = turnuva.max_katilimci != null && sayi != null && sayi >= turnuva.max_katilimci;

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
    const { error } = await supabase.from("basvurular").insert({
      turnuva_id: turnuva.id,
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
    <div className="t-kart">
      <div className="t-kart-ust">
        <div>
          <h3 className="t-kart-ad">{turnuva.ad}</h3>
          <p className="t-kart-meta">
            {turnuva.format && <span className="tag">{turnuva.format}</span>}
            {turnuva.tarih && <span className="t-day">{turnuva.tarih}</span>}
            <span className="t-day">
              {s.tKontenjan}:{" "}
              {sayi != null ? `${sayi}${turnuva.max_katilimci ? " / " + turnuva.max_katilimci : ""}` : "—"}
            </span>
          </p>
        </div>
        {durum !== "basarili" && (
          dolu ? (
            <span className="tag t-dolu">{s.tDolu}</span>
          ) : (
            <Btn kind={acik ? "ghost" : "red"} onClick={() => setAcik(!acik)}>
              {acik ? s.tVazgec : s.tBasvurBtn}
            </Btn>
          )
        )}
      </div>

      {turnuva.aciklama && <p className="t-kart-aciklama">{turnuva.aciklama}</p>}

      {durum === "basarili" ? (
        <div className="form-basari" role="status">
          <p><b>✓</b> {s.fBasari}</p>
          <Btn href={DISCORD_URL} kind="red" arrow="↗">{s.insaBtn}</Btn>
        </div>
      ) : (
        acik && !dolu && (
          <form className="t-form" onSubmit={gonder}>
            <div className="t-form-grid">
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
                <input
                  type="text" maxLength={100}
                  value={form.adSoyad} onChange={guncelle("adSoyad")}
                />
              </label>
            </div>
            {hata && <p className="form-hata" role="alert">{hata}</p>}
            <div className="t-form-alt">
              <Btn type="submit" kind="ink" disabled={durum === "gonderiliyor"}>
                {durum === "gonderiliyor" ? s.fGonderiliyor : s.fGonder}
              </Btn>
              <p className="t-discord-not">{s.tDiscordNot}</p>
            </div>
          </form>
        )
      )}
    </div>
  );
}

// Açık turnuvaları listeler; Supabase yapılandırılmamışsa veya açık
// turnuva yoksa null döner (sayfa bu durumda inşaat bildirimini gösterir).
export default function TurnuvaBasvuru({ onDurum }) {
  const { t } = useLang();
  const s = t.etkinlikler;
  const [turnuvalar, setTurnuvalar] = useState(null); // null = yükleniyor
  const [sayilar, setSayilar] = useState({});

  useEffect(() => {
    if (!supabase) {
      setTurnuvalar([]);
      onDurum?.("yok");
      return;
    }
    let iptal = false;
    (async () => {
      const { data, error } = await supabase
        .from("turnuvalar")
        .select("id, ad, aciklama, format, tarih, max_katilimci, durum")
        .eq("durum", "acik")
        .order("created_at", { ascending: false });
      if (iptal) return;
      const liste = error ? [] : data;
      setTurnuvalar(liste);
      onDurum?.(liste.length ? "var" : "yok");
      // Başvuru sayıları (sadece sayı döner, içerik dönmez)
      const ciftler = await Promise.all(
        liste.map(async (tr) => {
          const { data: n } = await supabase.rpc("basvuru_sayisi", { tid: tr.id });
          return [tr.id, typeof n === "number" ? n : null];
        })
      );
      if (!iptal) setSayilar(Object.fromEntries(ciftler));
    })();
    return () => { iptal = true; };
  }, []);

  if (!turnuvalar || turnuvalar.length === 0) return null;

  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <Reveal className="section-head">
          <p className="eyebrow">{s.turnuvaEyebrow}</p>
          <h2>{s.turnuvaH2}</h2>
        </Reveal>
        {turnuvalar.map((tr, i) => (
          <Reveal key={tr.id} delay={i * 0.05}>
            <TurnuvaKart turnuva={tr} sayi={sayilar[tr.id]} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
