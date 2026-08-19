import { useEffect, useState } from "react";
import Btn from "./Btn.jsx";
import AgacGorunum from "./AgacGorunum.jsx";
import { supabase } from "../supabase.js";
import { kalanOyuncular, BOLGE_SAYISI, TORBA_BOYU } from "../turnuvaAgaci.js";
import { useGeoProfiller } from "../geoProfil.js";

// ============================================================
// Admin: 32 kişilik turnuva için 4 torbalı kura + ağaç yönetimi.
// - Önce oyuncu profilleri (ad + GeoGuessr linki) kaydedilir; torbalar
//   bu listeden seçilerek doldurulur (gerekirse elle ad da eklenebilir).
// - "Kura Çek" her basışta 4 torbadan rastgele birer oyuncu seçip
//   sıradaki bölgeye koyar (8 basışta ağaç tamamlanır).
// - Ağaçta oyuncuya tıklayarak maçın kazananı işaretlenir.
// - "Yayınla" ile ağaç Etkinlikler sayfasında herkese açılır.
// ============================================================

const TORBA_BASLIK = ["Torba 1 (1-8)", "Torba 2 (9-16)", "Torba 3 (17-24)", "Torba 4 (25-32)"];
const TUR_ADLARI = ["Son 32", "Son 16", "Çeyrek Final", "Yarı Final", "Final"];
const URL_RE = /https?:\/\/\S+/;
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function satirlaraBol(metin) {
  return metin.split("\n").map((s) => s.trim()).filter(Boolean);
}

// "Ad<TAB>link" ya da "Ad link" satırlarını { ad: link } haritasına çevirir.
// Linksiz satırlar atlanır (hatalar listesine yazılır).
function profilleriAyristir(metin) {
  const oyuncular = {};
  const hatali = [];
  for (const satir of satirlaraBol(metin)) {
    const m = URL_RE.exec(satir);
    const ad = (m ? satir.slice(0, m.index) : satir).replace(/\t/g, " ").trim();
    if (!m || !ad) { hatali.push(satir); continue; }
    oyuncular[ad] = m[0].trim();
  }
  return { oyuncular, hatali };
}

function profilleriMetneCevir(oyuncular) {
  return Object.entries(oyuncular || {}).map(([ad, url]) => `${ad}\t${url}`).join("\n");
}

export default function KuraYonetimi({ turnuva }) {
  const [kayit, setKayit] = useState(undefined); // undefined = yükleniyor
  const [torbaListe, setTorbaListe] = useState([[], [], [], []]); // düzenlenen torbalar (kaydedilmemiş olabilir)
  const [elleAd, setElleAd] = useState(["", "", "", ""]);
  const [hata, setHata] = useState("");
  const [bekliyor, setBekliyor] = useState(false);
  const [sonBolge, setSonBolge] = useState(null); // animasyon: son çekilen bölge indeksi
  const [profilMetni, setProfilMetni] = useState("");
  const [yayinUrl, setYayinUrl] = useState("");
  const [slug, setSlug] = useState("");
  // Çiplerdeki avatarlar için profil verisi (ortak önbellek)
  const profiller = useGeoProfiller(Object.values(kayit?.oyuncular || {}));

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
      setProfilMetni(profilleriMetneCevir(satir.oyuncular));
      setYayinUrl(satir.yayin_url || "");
      setSlug(satir.slug || "");
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

  function torbayaEkle(p, ad) {
    const temiz = (ad || "").trim();
    if (!temiz) return;
    setHata("");
    if (torbaListe.some((t) => t.includes(temiz))) { setHata(`"${temiz}" zaten bir torbada.`); return; }
    if (torbaListe[p].length >= TORBA_BOYU) { setHata(`${TORBA_BASLIK[p]} dolu (${TORBA_BOYU} oyuncu).`); return; }
    setTorbaListe((l) => l.map((t, i) => (i === p ? [...t, temiz] : t)));
  }

  function torbadanCikar(p, ad) {
    setTorbaListe((l) => l.map((t, i) => (i === p ? t.filter((a) => a !== ad) : t)));
  }

  function torbalariKaydet() {
    guncelle({ torbalar: torbaListe });
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

  function profilleriKaydet() {
    const { oyuncular, hatali } = profilleriAyristir(profilMetni);
    if (hatali.length) {
      setHata("Şu satırlarda link bulunamadı: " + hatali.slice(0, 3).join(" · ") + (hatali.length > 3 ? " …" : ""));
      return;
    }
    guncelle({ oyuncular });
  }

  function sayfayiKaydet() {
    const temizSlug = slug.trim().toLowerCase();
    if (temizSlug && !SLUG_RE.test(temizSlug)) {
      setHata("Sayfa adresi sadece küçük harf, rakam ve tire içerebilir (örn. nm-2026).");
      return;
    }
    const temizYayin = yayinUrl.trim();
    if (temizYayin && !URL_RE.test(temizYayin)) {
      setHata("Yayın linki http(s):// ile başlamalı.");
      return;
    }
    guncelle({ slug: temizSlug || null, yayin_url: temizYayin });
  }

  if (hata && kayit === undefined) return <p className="form-hata" role="alert">{hata}</p>;
  if (kayit === undefined) return <p className="t-day">Ağaç yükleniyor…</p>;

  const torbalarHazir = kayit.torbalar.every((t) => t.length === TORBA_BOYU);
  const kuraBasladi = kayit.bolgeler.length > 0;
  const kuraBitti = kayit.bolgeler.length >= BOLGE_SAYISI;

  // Profil eşleşmesi: torbadaki adlardan kaçının linki var
  const torbaAdlari = kayit.torbalar.flat();
  const kayitliProfiller = kayit.oyuncular || {};
  const torbadakiler = torbaListe.flat();
  const secilebilir = Object.keys(kayitliProfiller).filter((ad) => !torbadakiler.includes(ad));
  const torbalarDegisti = JSON.stringify(torbaListe) !== JSON.stringify(kayit.torbalar);
  const profilsiz = torbaAdlari.filter((ad) => !kayitliProfiller[ad]);
  const fazlaProfil = Object.keys(kayitliProfiller).filter((ad) => torbaAdlari.length && !torbaAdlari.includes(ad));
  const sayfaYolu = `/turnuva/${kayit.slug || kayit.turnuva_id}`;

  return (
    <div className="kura-panel">
      {/* ---- Oyuncu profilleri (avatar / ülke / lig için) ---- */}
      <div className="kura-baslik">
        <h4>Oyuncu Profilleri</h4>
        <Btn kind="ink" onClick={profilleriKaydet} disabled={bekliyor}>
          {bekliyor ? "Kaydediliyor…" : "Profilleri Kaydet"}
        </Btn>
      </div>
      <p className="t-day">
        Her satıra <code>Ad</code> + sekme/boşluk + GeoGuessr profil linki (örn. <code>DK https://www.geoguessr.com/user/…</code>) — Excel/tablodan kopyalayıp yapıştırabilirsiniz.
        Adlar torbalardaki adlarla birebir aynı olmalı; avatar, ülke ve lig bilgisi bu linkten çekilir.
      </p>
      <label className="kura-torba kura-profiller">
        <span>
          Profiller — {Object.keys(kayitliProfiller).length} kayıtlı
          {torbaAdlari.length > 0 && profilsiz.length > 0 && ` · ${profilsiz.length} oyuncunun linki yok`}
        </span>
        <textarea
          rows={8}
          value={profilMetni}
          placeholder={"DK\thttps://www.geoguessr.com/user/616dadb53ea44c00014582b8"}
          onChange={(e) => setProfilMetni(e.target.value)}
        />
      </label>
      {torbaAdlari.length > 0 && profilsiz.length > 0 && (
        <p className="t-day">Linki olmayanlar: {profilsiz.join(", ")}</p>
      )}
      {fazlaProfil.length > 0 && (
        <p className="t-day">Torbalarda olmayan adlar (yazım farkı olabilir): {fazlaProfil.join(", ")}</p>
      )}

      {/* ---- Torbalar (profil listesinden seçerek) ---- */}
      <div className="kura-baslik">
        <h4>Torbalar</h4>
        {!kuraBasladi && (
          <Btn kind="ink" onClick={torbalariKaydet} disabled={bekliyor || !torbalarDegisti}>
            {bekliyor ? "Kaydediliyor…" : torbalarDegisti ? "Torbaları Kaydet" : "Torbalar Kayıtlı"}
          </Btn>
        )}
      </div>
      {kuraBasladi ? (
        <p className="t-day">Kura başladığı için torbalar kilitli. Düzenlemek için önce kurayı sıfırlayın.</p>
      ) : (
        <p className="t-day">
          Her torbaya güç sıralamasına göre 8 oyuncu seçin. Liste, aşağıda kaydettiğiniz oyuncu profillerinden gelir;
          listede olmayan birini eklemek için adını yazıp Enter'a basın.
          {torbalarDegisti && <b> Değişiklikler henüz kaydedilmedi.</b>}
        </p>
      )}
      <div className="kura-torbalar">
        {TORBA_BASLIK.map((baslik, p) => (
          <div key={baslik} className="kura-torba">
            <span>{baslik} — {torbaListe[p].length}/{TORBA_BOYU}</span>
            <ul className="kura-cipler">
              {torbaListe[p].map((ad) => (
                <li key={ad} className="kura-cip">
                  <span className="kura-cip-avatar" aria-hidden="true">
                    {profiller[kayitliProfiller[ad]]?.avatar
                      ? <img src={profiller[kayitliProfiller[ad]].avatar} alt="" />
                      : ad[0]}
                  </span>
                  <span className="kura-cip-ad" title={ad}>{ad}</span>
                  {!kayitliProfiller[ad] && <span className="kura-cip-uyari" title="Profil linki yok">!</span>}
                  {!kuraBasladi && (
                    <button type="button" className="kura-cip-sil" onClick={() => torbadanCikar(p, ad)} aria-label={`${ad} çıkar`}>×</button>
                  )}
                </li>
              ))}
              {torbaListe[p].length === 0 && <li className="t-day">Boş</li>}
            </ul>
            {!kuraBasladi && torbaListe[p].length < TORBA_BOYU && (
              <div className="kura-ekle">
                <select
                  className="kura-girdi"
                  value=""
                  onChange={(e) => torbayaEkle(p, e.target.value)}
                  disabled={secilebilir.length === 0}
                >
                  <option value="">{secilebilir.length ? "Listeden oyuncu ekle…" : "Listede seçilecek oyuncu kalmadı"}</option>
                  {secilebilir.map((ad) => <option key={ad} value={ad}>{ad}</option>)}
                </select>
                <input
                  className="kura-girdi"
                  type="text"
                  placeholder="veya ad yaz + Enter"
                  value={elleAd[p]}
                  onChange={(e) => setElleAd((m) => m.map((v, i) => (i === p ? e.target.value : v)))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      torbayaEkle(p, elleAd[p]);
                      setElleAd((m) => m.map((v, i) => (i === p ? "" : v)));
                    }
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ---- Sayfa ayarları ---- */}
      <div className="kura-baslik">
        <h4>Turnuva Sayfası</h4>
        <div className="admin-satir">
          <span className={`tag ${kayit.yayinda ? "turnuva-acik" : "turnuva-taslak"}`}>
            {kayit.yayinda ? "Sitede yayında" : "Yayında değil"}
          </span>
          {kayit.yayinda && (
            <a className="admin-mini" href={sayfaYolu} target="_blank" rel="noreferrer">Sayfayı Aç ↗</a>
          )}
          <Btn kind="ink" onClick={sayfayiKaydet} disabled={bekliyor}>
            {bekliyor ? "Kaydediliyor…" : "Ayarları Kaydet"}
          </Btn>
          <Btn
            kind={kayit.yayinda ? "ghost" : "red"}
            onClick={() => guncelle({ yayinda: !kayit.yayinda })}
            disabled={bekliyor}
          >
            {kayit.yayinda ? "Yayından Kaldır" : "Yayınla"}
          </Btn>
        </div>
      </div>
      <p className="t-day">
        Yayınlandığında <code>{sayfaYolu}</code> adresinde oyuncu kartları (torbalardan), eşleşmeler, ağaç ve canlı
        izleme sayfası (<code>{sayfaYolu}/canli</code>) herkese açılır. Torbalar ve kura boşken de yayınlanabilir;
        burada kaydettiğiniz her değişiklik (torbalar, profiller, kura, maç sonuçları) sayfaya anında yansır —
        açık olan izleyici sayfaları 30 saniyede bir kendini yeniler.
      </p>
      {hata && <p className="form-hata" role="alert">{hata}</p>}
      <div className="kura-torbalar">
        <label className="kura-torba">
          <span>Sayfa adresi (slug, opsiyonel)</span>
          <input
            className="kura-girdi"
            type="text"
            value={slug}
            placeholder="nm-2026"
            onChange={(e) => setSlug(e.target.value)}
          />
        </label>
        <label className="kura-torba">
          <span>Canlı yayın linki (YouTube)</span>
          <input
            className="kura-girdi"
            type="url"
            value={yayinUrl}
            placeholder="https://www.youtube.com/live/…"
            onChange={(e) => setYayinUrl(e.target.value)}
          />
        </label>
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
            <span className={`tag ${kayit.yayinda ? "turnuva-acik" : "turnuva-taslak"}`}>
              {kayit.yayinda ? "Sitede yayında" : "Yayında değil"}
            </span>
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
