import { useEffect, useState } from "react";
import Btn from "./Btn.jsx";
import AgacGorunum from "./AgacGorunum.jsx";
import { supabase } from "../supabase.js";
import { kalanOyuncular, BOLGE_SAYISI, TORBA_BOYU } from "../turnuvaAgaci.js";

// ============================================================
// Admin: 32 kişilik turnuva için 4 torbalı kura + ağaç yönetimi.
// - 4 torbaya 8'er oyuncu yazılır (her satıra bir ad).
// - "Kura Çek" her basışta 4 torbadan rastgele birer oyuncu seçip
//   sıradaki bölgeye koyar (8 basışta ağaç tamamlanır).
// - Ağaçta oyuncuya tıklayarak maçın kazananı işaretlenir.
// - "Yayınla" ile ağaç Etkinlikler sayfasında herkese açılır.
// ============================================================

const TORBA_BASLIK = ["Torba 1 (1-8)", "Torba 2 (9-16)", "Torba 3 (17-24)", "Torba 4 (25-32)"];
const TUR_ADLARI = ["Son 32", "Son 16", "Çeyrek Final", "Yarı Final", "Final"];

function satirlaraBol(metin) {
  return metin.split("\n").map((s) => s.trim()).filter(Boolean);
}

export default function KuraYonetimi({ turnuva }) {
  const [kayit, setKayit] = useState(undefined); // undefined = yükleniyor
  const [metinler, setMetinler] = useState(["", "", "", ""]);
  const [hata, setHata] = useState("");
  const [bekliyor, setBekliyor] = useState(false);
  const [sonBolge, setSonBolge] = useState(null); // animasyon: son çekilen bölge indeksi

  // Kayıt yoksa varsayılan satırı oluştur (yayinda=false ile başlar)
  useEffect(() => {
    let iptal = false;
    (async () => {
      const { data, error } = await supabase
        .from("turnuva_agaclari")
        .select("*")
        .eq("turnuva_id", turnuva.id)
        .maybeSingle();
      if (iptal) return;
      if (error) { setHata("Ağaç yüklenemedi: " + error.message); return; }
      let satir = data;
      if (!satir) {
        const { data: yeni, error: ekleHata } = await supabase
          .from("turnuva_agaclari")
          .insert({ turnuva_id: turnuva.id })
          .select()
          .single();
        if (iptal) return;
        if (ekleHata) { setHata("Ağaç oluşturulamadı: " + ekleHata.message); return; }
        satir = yeni;
      }
      setKayit(satir);
      setMetinler(satir.torbalar.map((t) => t.join("\n")));
    })();
    return () => { iptal = true; };
  }, [turnuva.id]);

  async function guncelle(degisiklik) {
    setHata("");
    setBekliyor(true);
    const { data, error } = await supabase
      .from("turnuva_agaclari")
      .update(degisiklik)
      .eq("turnuva_id", turnuva.id)
      .select()
      .single();
    setBekliyor(false);
    if (error) { setHata("Kaydedilemedi: " + error.message); return null; }
    setKayit(data);
    return data;
  }

  function torbalariKaydet() {
    const torbalar = metinler.map(satirlaraBol);
    const hepsi = torbalar.flat();
    const tekrarlar = hepsi.filter((ad, i) => hepsi.indexOf(ad) !== i);
    if (tekrarlar.length > 0) {
      setHata("Aynı ad birden fazla kez yazılmış: " + [...new Set(tekrarlar)].join(", "));
      return;
    }
    const eksik = torbalar.findIndex((t) => t.length !== TORBA_BOYU);
    if (eksik !== -1 && torbalar[eksik].length > TORBA_BOYU) {
      setHata(`${TORBA_BASLIK[eksik]} en fazla ${TORBA_BOYU} oyuncu alır (${torbalar[eksik].length} yazılmış).`);
      return;
    }
    guncelle({ torbalar });
  }

  async function kuraCek(adet) {
    const onceki = kayit.bolgeler.length;
    const bolgeler = [...kayit.bolgeler];
    for (let i = 0; i < adet && bolgeler.length < BOLGE_SAYISI; i++) {
      const kalan = kalanOyuncular(kayit.torbalar, bolgeler);
      bolgeler.push(kalan.map((torba) => torba[Math.floor(Math.random() * torba.length)]));
    }
    const sonuc = await guncelle({ bolgeler });
    // Tek bölge çekildiyse o bölgenin oyuncuları animasyonla belirir
    if (sonuc) setSonBolge(adet === 1 ? onceki : null);
  }

  async function kurayiSifirla() {
    if (!window.confirm("Kura ve tüm maç sonuçları silinsin mi? Bu işlem geri alınamaz.")) return;
    setSonBolge(null);
    await guncelle({ bolgeler: [], sonuclar: {} });
  }

  function kazananSec(mac, oyuncu) {
    const sonuclar = { ...kayit.sonuclar };
    if (sonuclar[mac.id] === oyuncu) delete sonuclar[mac.id];
    else sonuclar[mac.id] = oyuncu;
    setSonBolge(null);
    guncelle({ sonuclar });
  }

  if (hata && kayit === undefined) return <p className="form-hata" role="alert">{hata}</p>;
  if (kayit === undefined) return <p className="t-day">Ağaç yükleniyor…</p>;

  const torbalarHazir = kayit.torbalar.every((t) => t.length === TORBA_BOYU);
  const kuraBasladi = kayit.bolgeler.length > 0;
  const kuraBitti = kayit.bolgeler.length >= BOLGE_SAYISI;

  return (
    <div className="kura-panel">
      {/* ---- Torbalar ---- */}
      <div className="kura-baslik">
        <h4>Torbalar</h4>
        {!kuraBasladi && (
          <Btn kind="ink" onClick={torbalariKaydet} disabled={bekliyor}>
            {bekliyor ? "Kaydediliyor…" : "Torbaları Kaydet"}
          </Btn>
        )}
      </div>
      {kuraBasladi ? (
        <p className="t-day">Kura başladığı için torbalar kilitli. Düzenlemek için önce kurayı sıfırlayın.</p>
      ) : (
        <p className="t-day">Her torbaya güç sıralamasına göre 8 oyuncu yazın — her satıra bir ad.</p>
      )}
      <div className="kura-torbalar">
        {TORBA_BASLIK.map((baslik, p) => (
          <label key={baslik} className="kura-torba">
            <span>{baslik} — {satirlaraBol(metinler[p]).length}/{TORBA_BOYU}</span>
            <textarea
              rows={8}
              value={metinler[p]}
              disabled={kuraBasladi}
              onChange={(e) => setMetinler((m) => m.map((v, i) => (i === p ? e.target.value : v)))}
            />
          </label>
        ))}
      </div>

      {/* ---- Kura ---- */}
      <div className="kura-baslik">
        <h4>Kura — Bölge {Math.min(kayit.bolgeler.length + 1, BOLGE_SAYISI)}/{BOLGE_SAYISI}</h4>
        <div className="admin-satir">
          {!kuraBitti && (
            <>
              <Btn kind="red" onClick={() => kuraCek(1)} disabled={!torbalarHazir || bekliyor}>
                Kura Çek
              </Btn>
              {torbalarHazir && (
                <Btn kind="ghost" onClick={() => kuraCek(BOLGE_SAYISI)} disabled={bekliyor}>
                  Kalanların Hepsini Çek
                </Btn>
              )}
            </>
          )}
          {kuraBasladi && (
            <button className="admin-mini red" onClick={kurayiSifirla} disabled={bekliyor}>
              Kurayı Sıfırla
            </button>
          )}
        </div>
      </div>
      {!torbalarHazir && !kuraBasladi && (
        <p className="t-day">Kura çekilebilmesi için 4 torbanın da 8'er oyuncuyla kaydedilmiş olması gerekir.</p>
      )}
      {torbalarHazir && !kuraBitti && (
        <p className="t-day">
          Her basışta 4 torbadan rastgele birer oyuncu çekilir ve sıradaki bölgeye yerleştirilir.
          İlk tur eşleşmeleri: Torba 1 vs Torba 4 · Torba 2 vs Torba 3.
        </p>
      )}

      {/* ---- Ağaç ---- */}
      {kuraBasladi && (
        <>
          <div className="kura-baslik">
            <h4>Turnuva Ağacı</h4>
            <div className="admin-satir">
              <span className={`tag ${kayit.yayinda ? "turnuva-acik" : "turnuva-taslak"}`}>
                {kayit.yayinda ? "Sitede yayında" : "Yayında değil"}
              </span>
              <Btn
                kind={kayit.yayinda ? "ghost" : "ink"}
                onClick={() => guncelle({ yayinda: !kayit.yayinda })}
                disabled={bekliyor}
              >
                {kayit.yayinda ? "Yayından Kaldır" : "Yayınla"}
              </Btn>
            </div>
          </div>
          <p className="t-day">Maçın kazananını işaretlemek için oyuncunun adına tıklayın; geri almak için tekrar tıklayın.</p>
          <AgacGorunum
            bolgeler={kayit.bolgeler}
            sonuclar={kayit.sonuclar}
            turAdlari={TUR_ADLARI}
            sampiyonEtiket="Şampiyon"
            onKazanan={kazananSec}
            yeniBolge={sonBolge}
          />
        </>
      )}

      {hata && <p className="form-hata" role="alert">{hata}</p>}
    </div>
  );
}
