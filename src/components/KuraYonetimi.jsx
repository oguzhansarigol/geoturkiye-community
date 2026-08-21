import { useEffect, useState } from "react";
import Btn from "./Btn.jsx";
import AgacGorunum from "./AgacGorunum.jsx";
import { supabase } from "../supabase.js";
import { kalanOyuncular, cekilenMacSayisi, MAC_SAYISI, TORBA_SAYISI, TORBA_BOYU } from "../turnuvaAgaci.js";
import { useGeoProfiller } from "../geoProfil.js";

// ============================================================
// Admin: 32 kişilik turnuva için 4 torbalı kura + ağaç yönetimi.
// Panel dört adımdan oluşur; her adım kendi kartında, kendi tek
// "Kaydet" butonuyla yönetilir. Üstteki durum şeridi yayın ve sayfa
// ayarlarını toplar.
//   1. Oyuncu profilleri (ad + GeoGuessr linki)
//   2. Torbalar (puan tablosu; puana göre sıralanıp 4 × 8 torbaya
//      kendiliğinden yerleşir)
//   3. Kura (her basışta bir eşleşme; 16 basışta ağaç tamamlanır)
//   4. Ağaç (oyuncuya tıklayarak kazanan işaretlenir)
// ============================================================

const TORBA_BASLIK = ["Torba 1", "Torba 2", "Torba 3", "Torba 4"];
const TUR_ADLARI = ["Son 32", "Son 16", "Çeyrek Final", "Yarı Final", "Final"];
const URL_RE = /https?:\/\/\S+/;
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MESAJ_SURESI = 2500;

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

// Bölüm kartı: numara + başlık + kısa durum solda, işlem butonları sağda.
// Başlığa tıklayınca içerik açılır/kapanır.
function Bolum({ no, baslik, durum, tamam, acik, onAc, islemler, children }) {
  return (
    <section className={`kura-bolum${acik ? " acik" : ""}${tamam ? " tamam" : ""}`}>
      <header className="kura-bolum-ust">
        <button type="button" className="kura-bolum-baslik" onClick={onAc} aria-expanded={acik}>
          <span className="kura-bolum-no" aria-hidden="true">{tamam ? "✓" : no}</span>
          <span className="kura-bolum-ad">{baslik}</span>
          {durum && <span className="kura-bolum-durum">{durum}</span>}
          <span className="kura-bolum-ok" aria-hidden="true">{acik ? "−" : "+"}</span>
        </button>
        {islemler && <div className="kura-bolum-islemler">{islemler}</div>}
      </header>
      {acik && <div className="kura-bolum-icerik">{children}</div>}
    </section>
  );
}

export default function KuraYonetimi({ turnuva }) {
  const [kayit, setKayit] = useState(undefined); // undefined = yükleniyor
  const [puanlar, setPuanlar] = useState({}); // { ad: girdi metni } — torba sıralaması buradan türer
  const [hata, setHata] = useState("");
  const [mesaj, setMesaj] = useState(""); // kısa süreli başarı bildirimi
  const [bekliyor, setBekliyor] = useState(false);
  const [sonMac, setSonMac] = useState(null); // animasyon: son çekilen eşleşme indeksi (0-15)
  const [profilMetni, setProfilMetni] = useState("");
  const [yayinUrl, setYayinUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [ayarAcik, setAyarAcik] = useState(false);
  const [acikBolum, setAcikBolum] = useState(null); // "profil" | "torba" | "kura" | "agac" | null
  // Çiplerdeki avatarlar için profil verisi (ortak önbellek)
  const profiller = useGeoProfiller(Object.values(kayit?.oyuncular || {}));

  // Başarı mesajı kısa süre sonra kendiliğinden kaybolur
  useEffect(() => {
    if (!mesaj) return;
    const z = setTimeout(() => setMesaj(""), MESAJ_SURESI);
    return () => clearTimeout(z);
  }, [mesaj]);

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
      setPuanlar(Object.fromEntries(Object.entries(satir.puanlar || {}).map(([ad, p]) => [ad, String(p)])));
      setProfilMetni(profilleriMetneCevir(satir.oyuncular));
      setYayinUrl(satir.yayin_url || "");
      setSlug(satir.slug || "");
      // İlk tamamlanmamış adım açık gelir
      const profilVar = Object.keys(satir.oyuncular || {}).length > 0;
      const torbaHazir = satir.torbalar.every((t) => t.length === TORBA_BOYU);
      const kuraVar = satir.bolgeler.length > 0;
      setAcikBolum(kuraVar ? "agac" : torbaHazir ? "kura" : profilVar ? "torba" : "profil");
    })();
    return () => { iptal = true; };
  }, [turnuva.id]);

  async function guncelle(degisiklik, basariMesaji = "Kaydedildi") {
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
    if (basariMesaji) setMesaj(basariMesaji);
    return data;
  }

  function bolumAc(ad) {
    setAcikBolum((a) => (a === ad ? null : ad));
  }

  // ---- Profiller ----
  function profilleriKaydet() {
    const { oyuncular, hatali } = profilleriAyristir(profilMetni);
    if (hatali.length) {
      setHata("Şu satırlarda link bulunamadı: " + hatali.slice(0, 3).join(" · ") + (hatali.length > 3 ? " …" : ""));
      return;
    }
    guncelle({ oyuncular }, `${Object.keys(oyuncular).length} profil kaydedildi`);
  }

  // ---- Torbalar ----
  // Girilen puan metni → sayı; boş/geçersizse null (sıralamada en sona düşer)
  function puanDeger(ad) {
    const n = parseFloat(String(puanlar[ad] ?? "").trim().replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }

  function puanYaz(ad, deger) {
    setPuanlar((p) => ({ ...p, [ad]: deger }));
  }

  // ---- Kura ----
  // Her çağrıda "adet" eşleşme çeker. Bir bölgede önce Torba 1 vs 4,
  // sonra Torba 2 vs 3 çekilir; yarım bölge [t1, null, null, t4] olur.
  async function kuraCek(adet) {
    const bolgeler = kayit.bolgeler.map((b) => [...b]);
    const ilkYeni = cekilenMacSayisi(bolgeler);
    for (let i = 0; i < adet && cekilenMacSayisi(bolgeler) < MAC_SAYISI; i++) {
      const kalan = kalanOyuncular(kayit.torbalar, bolgeler);
      const rasgele = (p) => kalan[p][Math.floor(Math.random() * kalan[p].length)];
      const son = bolgeler[bolgeler.length - 1];
      if (son && son[1] == null) {
        son[1] = rasgele(1);
        son[2] = rasgele(2);
      } else {
        bolgeler.push([rasgele(0), null, null, rasgele(3)]);
      }
    }
    const sonuc = await guncelle({ bolgeler }, null);
    // Tek eşleşme çekildiyse kura listesinde (ve ağaçta) animasyonla belirir
    if (sonuc) {
      setSonMac(adet === 1 ? ilkYeni : null);
      if (adet !== 1) setAcikBolum("agac");
    }
  }

  async function kurayiSifirla() {
    if (!window.confirm("Kura ve tüm maç sonuçları silinsin mi? Bu işlem geri alınamaz.")) return;
    setSonMac(null);
    const sonuc = await guncelle({ bolgeler: [], sonuclar: {} }, "Kura sıfırlandı");
    if (sonuc) setAcikBolum("kura");
  }

  // ---- Ağaç ----
  function kazananSec(mac, oyuncu) {
    const sonuclar = { ...kayit.sonuclar };
    if (sonuclar[mac.id] === oyuncu) delete sonuclar[mac.id];
    else sonuclar[mac.id] = oyuncu;
    setSonMac(null);
    guncelle({ sonuclar }, null);
  }

  // ---- Sayfa ayarları ----
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
    guncelle({ slug: temizSlug || null, yayin_url: temizYayin }, "Sayfa ayarları kaydedildi");
  }

  if (hata && kayit === undefined) return <p className="form-hata" role="alert">{hata}</p>;
  if (kayit === undefined) return <p className="t-day">Ağaç yükleniyor…</p>;

  // ---- Türetilmiş durumlar ----
  const kayitliProfiller = kayit.oyuncular || {};
  const profilSayisi = Object.keys(kayitliProfiller).length;
  const profilDegisti = profilMetni.trim() !== profilleriMetneCevir(kayitliProfiller).trim();

  const torbalarHazir = kayit.torbalar.every((t) => t.length === TORBA_BOYU);
  const torbaAdlari = kayit.torbalar.flat();
  const profilsiz = torbaAdlari.filter((ad) => ad && !kayitliProfiller[ad]);

  // Puan tablosu: profil listesi + (varsa) kayıtlı torbalardaki adlar,
  // puana göre büyükten küçüğe sıralanır; ilk 8 → Torba 1, sonraki 8 → Torba 2 …
  const tumOyuncular = [...new Set([...Object.keys(kayitliProfiller), ...torbaAdlari])].filter(Boolean);
  const siraliOyuncular = [...tumOyuncular].sort((a, b) => {
    const pa = puanDeger(a), pb = puanDeger(b);
    if (pa == null && pb == null) return a.localeCompare(b, "tr");
    if (pa == null) return 1;
    if (pb == null) return -1;
    return pb - pa || a.localeCompare(b, "tr");
  });
  const turetilenTorbalar = Array.from({ length: TORBA_SAYISI }, (_, p) =>
    siraliOyuncular.slice(p * TORBA_BOYU, (p + 1) * TORBA_BOYU)
  );
  const sayisalPuanlar = Object.fromEntries(
    tumOyuncular.map((ad) => [ad, puanDeger(ad)]).filter(([, p]) => p != null)
  );
  const puanKolonuVar = "puanlar" in kayit; // supabase/turnuva-puanlar.sql çalıştırılmış mı?
  // jsonb anahtar sırası korunmadığından puanlar sıradan bağımsız karşılaştırılır
  const puanImza = (p) => JSON.stringify(Object.entries(p || {}).sort((a, b) => (a[0] < b[0] ? -1 : 1)));
  const torbalarDegisti =
    JSON.stringify(turetilenTorbalar) !== JSON.stringify(kayit.torbalar) ||
    (puanKolonuVar && puanImza(sayisalPuanlar) !== puanImza(kayit.puanlar));

  function torbalariKaydet() {
    const degisiklik = { torbalar: turetilenTorbalar };
    if (puanKolonuVar) degisiklik.puanlar = sayisalPuanlar;
    guncelle(degisiklik, "Torbalar kaydedildi");
  }

  function torbalariGeriAl() {
    setPuanlar(Object.fromEntries(Object.entries(kayit.puanlar || {}).map(([ad, p]) => [ad, String(p)])));
    setHata("");
  }

  const kuraBasladi = kayit.bolgeler.length > 0;
  const cekilenMac = cekilenMacSayisi(kayit.bolgeler);
  const kuraBitti = cekilenMac >= MAC_SAYISI;
  const sonucSayisi = Object.keys(kayit.sonuclar || {}).length;

  const sayfaYolu = `/turnuva/${kayit.slug || kayit.turnuva_id}`;
  const ayarDegisti = slug.trim() !== (kayit.slug || "") || yayinUrl.trim() !== (kayit.yayin_url || "");

  return (
    <div className="kura-panel">
      {/* ================= Durum şeridi: yayın + sayfa ================= */}
      <div className="kura-serit">
        <div className="kura-serit-sol">
          <span className={`tag ${kayit.yayinda ? "turnuva-acik" : "turnuva-taslak"}`}>
            {kayit.yayinda ? "Yayında" : "Yayında değil"}
          </span>
          <a className="kura-serit-link" href={sayfaYolu} target="_blank" rel="noreferrer" title="Turnuva sayfasını yeni sekmede aç">
            <code>{sayfaYolu}</code> ↗
          </a>
          <a className="kura-serit-link" href={`${sayfaYolu}/canli`} target="_blank" rel="noreferrer" title="Canlı izleme sayfasını yeni sekmede aç">
            <code>/canli</code> ↗
          </a>
        </div>
        <div className="kura-serit-sag">
          <button
            type="button"
            className={`admin-mini${ayarAcik ? " aktif" : ""}`}
            onClick={() => setAyarAcik((a) => !a)}
            aria-expanded={ayarAcik}
          >
            Sayfa Ayarları
          </button>
          <Btn
            small
            kind={kayit.yayinda ? "ghost" : "red"}
            onClick={() => guncelle({ yayinda: !kayit.yayinda }, kayit.yayinda ? "Yayından kaldırıldı" : "Yayınlandı")}
            disabled={bekliyor}
          >
            {kayit.yayinda ? "Yayından Kaldır" : "Yayınla"}
          </Btn>
        </div>
      </div>

      {ayarAcik && (
        <div className="kura-ayarlar">
          <label className="kura-alan">
            <span>Sayfa adresi (slug)</span>
            <input
              className="kura-girdi"
              type="text"
              value={slug}
              placeholder="nm-2026"
              onChange={(e) => setSlug(e.target.value)}
            />
            <small>Boş bırakılırsa turnuva kimliği kullanılır. Küçük harf, rakam ve tire.</small>
          </label>
          <label className="kura-alan">
            <span>Canlı yayın linki (YouTube)</span>
            <input
              className="kura-girdi"
              type="url"
              value={yayinUrl}
              placeholder="https://www.youtube.com/live/…"
              onChange={(e) => setYayinUrl(e.target.value)}
            />
            <small>Canlı izleme sayfasına gömülür; boşsa sayfa sadece ağacı gösterir.</small>
          </label>
          <div className="kura-ayarlar-islem">
            <Btn small kind="ink" onClick={sayfayiKaydet} disabled={bekliyor || !ayarDegisti}>
              {bekliyor ? "Kaydediliyor…" : "Kaydet"}
            </Btn>
          </div>
        </div>
      )}

      {/* Tek bildirim alanı: hata ya da kısa başarı mesajı */}
      <div className="kura-bildirim" aria-live="polite">
        {hata && <p className="form-hata" role="alert">{hata}</p>}
        {!hata && mesaj && <p className="kura-basari">✓ {mesaj}</p>}
      </div>

      {/* ================= 1. Oyuncu profilleri ================= */}
      <Bolum
        no={1}
        baslik="Oyuncu Profilleri"
        durum={
          profilSayisi === 0
            ? "Henüz profil yok"
            : `${profilSayisi} profil${profilsiz.length ? ` · ${profilsiz.length} oyuncunun linki yok` : ""}`
        }
        tamam={profilSayisi > 0 && profilsiz.length === 0}
        acik={acikBolum === "profil"}
        onAc={() => bolumAc("profil")}
        islemler={
          <>
            {profilDegisti && (
              <button type="button" className="admin-mini" onClick={() => setProfilMetni(profilleriMetneCevir(kayitliProfiller))} disabled={bekliyor}>
                Geri Al
              </button>
            )}
            <Btn small kind="ink" onClick={profilleriKaydet} disabled={bekliyor || !profilDegisti}>
              {bekliyor ? "Kaydediliyor…" : "Kaydet"}
            </Btn>
          </>
        }
      >
        <textarea
          className="kura-metin"
          rows={10}
          value={profilMetni}
          placeholder={"DK\thttps://www.geoguessr.com/user/616dadb53ea44c00014582b8"}
          onChange={(e) => setProfilMetni(e.target.value)}
          spellCheck={false}
        />
        {profilsiz.length > 0 && (
          <ul className="kura-notlar">
            <li><b>Linki olmayanlar:</b> {profilsiz.join(", ")}</li>
          </ul>
        )}
      </Bolum>

      {/* ================= 2. Torbalar (puan tablosu) ================= */}
      <Bolum
        no={2}
        baslik="Torbalar"
        durum={
          kuraBasladi
            ? "Kura başladı · kilitli"
            : `${Math.min(siraliOyuncular.length, TORBA_BOYU * TORBA_SAYISI)}/${TORBA_BOYU * TORBA_SAYISI} oyuncu${torbalarDegisti ? " · kaydedilmemiş değişiklik" : ""}`
        }
        tamam={torbalarHazir}
        acik={acikBolum === "torba"}
        onAc={() => bolumAc("torba")}
        islemler={
          !kuraBasladi && (
            <>
              {torbalarDegisti && (
                <button type="button" className="admin-mini" onClick={torbalariGeriAl} disabled={bekliyor}>Geri Al</button>
              )}
              <Btn small kind="ink" onClick={torbalariKaydet} disabled={bekliyor || !torbalarDegisti}>
                {bekliyor ? "Kaydediliyor…" : "Kaydet"}
              </Btn>
            </>
          )
        }
      >
        <div className="kura-puan-sarici">
          <table className="kura-puan-tablo">
            <thead>
              <tr>
                <th className="sag">#</th>
                <th>Oyuncu</th>
                <th className="sag">Puan</th>
                <th>Torba</th>
              </tr>
            </thead>
            <tbody>
              {siraliOyuncular.map((ad, i) => {
                const torbaNo = i < TORBA_BOYU * TORBA_SAYISI ? Math.floor(i / TORBA_BOYU) : null;
                return (
                  <tr key={ad} className={i > 0 && i % TORBA_BOYU === 0 ? "torba-basi" : undefined}>
                    <td className="sag kura-puan-sira">{i + 1}</td>
                    <td>
                      <span className="kura-puan-oyuncu">
                        <span className="kura-cip-avatar" aria-hidden="true">
                          {profiller[kayitliProfiller[ad]]?.avatar
                            ? <img src={profiller[kayitliProfiller[ad]].avatar} alt="" />
                            : ad[0]}
                        </span>
                        <span className="kura-cip-ad" title={ad}>{ad}</span>
                        {!kayitliProfiller[ad] && <span className="kura-cip-uyari" title="Profil linki yok">!</span>}
                      </span>
                    </td>
                    <td className="sag">
                      <input
                        className="kura-girdi kura-puan-girdi"
                        type="text"
                        inputMode="decimal"
                        placeholder="—"
                        value={puanlar[ad] ?? ""}
                        onChange={(e) => puanYaz(ad, e.target.value)}
                        disabled={kuraBasladi}
                        aria-label={`${ad} puanı`}
                      />
                    </td>
                    <td>
                      <span className={`kura-puan-torba${torbaNo == null ? " yok" : ""}`}>
                        {torbaNo == null ? "Torba dışı" : TORBA_BASLIK[torbaNo]}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {siraliOyuncular.length === 0 && (
                <tr><td colSpan={4} className="kura-cip-bos">Önce oyuncu profillerini kaydedin.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {siraliOyuncular.length > TORBA_BOYU * TORBA_SAYISI && (
          <ul className="kura-notlar">
            <li><b>Uyarı:</b> {siraliOyuncular.length - TORBA_BOYU * TORBA_SAYISI} oyuncu sıralamada ilk 32'nin dışında kaldığı için torbalara girmeyecek.</li>
          </ul>
        )}
      </Bolum>

      {/* ================= 3. Kura ================= */}
      <Bolum
        no={3}
        baslik="Kura"
        durum={
          kuraBitti
            ? "Tamamlandı"
            : kuraBasladi
              ? `${cekilenMac}/${MAC_SAYISI} eşleşme çekildi`
              : torbalarHazir
                ? "Hazır"
                : "Torbalar tamamlanınca açılır"
        }
        tamam={kuraBitti}
        acik={acikBolum === "kura"}
        onAc={() => bolumAc("kura")}
        islemler={
          <>
            {kuraBasladi && (
              <button type="button" className="admin-mini red" onClick={kurayiSifirla} disabled={bekliyor}>
                Sıfırla
              </button>
            )}
            {!kuraBitti && torbalarHazir && (
              <button type="button" className="admin-mini" onClick={() => kuraCek(MAC_SAYISI)} disabled={bekliyor}>
                Hepsini Çek
              </button>
            )}
            {!kuraBitti && (
              <Btn small kind="red" onClick={() => kuraCek(1)} disabled={!torbalarHazir || bekliyor}>
                Kura Çek
              </Btn>
            )}
          </>
        }
      >
        <ol className="kura-maclar">
          {Array.from({ length: MAC_SAYISI }, (_, m) => {
            const b = kayit.bolgeler[Math.floor(m / 2)];
            const ust = b ? (m % 2 === 0 ? b[0] : b[1]) : null;
            const alt = b ? (m % 2 === 0 ? b[3] : b[2]) : null;
            const cekildi = Boolean(ust && alt);
            return (
              <li key={m} className={`kura-mac${cekildi ? " cekildi" : ""}${cekildi && sonMac === m ? " kura-mac--yeni" : ""}`}>
                <span className="kura-mac-no">B{Math.floor(m / 2) + 1}·M{m + 1}</span>
                {cekildi ? (
                  <>
                    <span className="kura-mac-taraf ust">
                      <span className="kura-cip-avatar" aria-hidden="true">
                        {profiller[kayitliProfiller[ust]]?.avatar
                          ? <img src={profiller[kayitliProfiller[ust]].avatar} alt="" />
                          : ust[0]}
                      </span>
                      <span className="kura-cip-ad" title={ust}>{ust}</span>
                    </span>
                    <span className="kura-mac-vs">vs</span>
                    <span className="kura-mac-taraf alt">
                      <span className="kura-cip-ad" title={alt}>{alt}</span>
                      <span className="kura-cip-avatar" aria-hidden="true">
                        {profiller[kayitliProfiller[alt]]?.avatar
                          ? <img src={profiller[kayitliProfiller[alt]].avatar} alt="" />
                          : alt[0]}
                      </span>
                    </span>
                  </>
                ) : (
                  <span className="kura-mac-bos">Henüz çekilmedi</span>
                )}
              </li>
            );
          })}
        </ol>
      </Bolum>

      {/* ================= 4. Ağaç ================= */}
      <Bolum
        no={4}
        baslik="Turnuva Ağacı"
        durum={kuraBasladi ? `${sonucSayisi}/31 maç sonuçlandı` : "Kura çekilince oluşur"}
        tamam={sonucSayisi >= 31}
        acik={acikBolum === "agac"}
        onAc={() => bolumAc("agac")}
      >
        {kuraBasladi ? (
          <AgacGorunum
            bolgeler={kayit.bolgeler}
            sonuclar={kayit.sonuclar}
            turAdlari={TUR_ADLARI}
            sampiyonEtiket="Şampiyon"
            onKazanan={kazananSec}
            yeniMac={sonMac}
          />
        ) : (
          <p className="kura-cip-bos">Henüz kura çekilmedi.</p>
        )}
      </Bolum>
    </div>
  );
}
