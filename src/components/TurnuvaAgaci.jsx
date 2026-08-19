import { useEffect, useState } from "react";
import Reveal from "./Reveal.jsx";
import AgacGorunum from "./AgacGorunum.jsx";
import Btn from "./Btn.jsx";
import { turnuvaYolu } from "../turnuvaSayfa.js";
import { supabase } from "../supabase.js";
import { useLang } from "../i18n.jsx";

// ============================================================
// Etkinlikler sayfası: yayına alınmış turnuva ağaçlarını gösterir.
// Yayında ağaç yoksa (veya Supabase yapılandırılmamışsa) bölüm
// hiç görünmez. Ağaç salt okunurdur; kura ve sonuçlar admin
// panelinden yönetilir.
// ============================================================

export default function TurnuvaAgaci() {
  const { t } = useLang();
  const s = t.etkinlikler;
  const [liste, setListe] = useState(null); // null = yükleniyor

  useEffect(() => {
    if (!supabase) { setListe([]); return; }
    let iptal = false;
    (async () => {
      const { data, error } = await supabase
        .from("turnuva_agaclari")
        .select("turnuva_id, slug, bolgeler, sonuclar, turnuvalar!inner(ad, format, tarih)")
        .eq("yayinda", true)
        .order("created_at", { ascending: false });
      if (!iptal) setListe(error ? [] : data || []);
    })();
    return () => { iptal = true; };
  }, []);

  if (!liste || liste.length === 0) return null;

  return (
    <section className="section" id="turnuva-agaci" style={{ paddingTop: 0, scrollMarginTop: "90px" }}>
      <div className="container">
        <Reveal className="section-head">
          <p className="eyebrow">{s.agacEyebrow}</p>
          <h2>{s.agacH2}</h2>
        </Reveal>
        {liste.map((agac, i) => (
          <Reveal key={agac.turnuva_id} delay={i * 0.05}>
            <div className="agac-kart">
              <div className="agac-kart-ust">
                <div>
                  <h3 className="t-kart-ad">{agac.turnuvalar.ad}</h3>
                  <p className="t-kart-meta">
                    {agac.turnuvalar.format && <span className="tag">{agac.turnuvalar.format}</span>}
                    {agac.turnuvalar.tarih && <span className="t-day">{agac.turnuvalar.tarih}</span>}
                  </p>
                </div>
                <div className="admin-satir">
                  <Btn to={turnuvaYolu(agac)} kind="ink" arrow="→">{s.tSayfaBtn}</Btn>
                  <Btn to={turnuvaYolu(agac, true)} kind="red" arrow="→">{t.turnuva.canliBtn}</Btn>
                </div>
              </div>
              {(agac.bolgeler || []).length > 0 ? (
                <AgacGorunum
                  bolgeler={agac.bolgeler}
                  sonuclar={agac.sonuclar}
                  turAdlari={s.agacTurlar}
                  sampiyonEtiket={s.agacSampiyon}
                />
              ) : (
                <p className="t-day">{t.turnuva.kuraBekleniyor}</p>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
