import { useEffect, useState } from "react";
import Btn from "./Btn.jsx";
import AgacGorunum from "./AgacGorunum.jsx";
import { supabase } from "../supabase.js";
import { kalanOyuncular, BOLGE_SAYISI, TORBA_BOYU } from "../turnuvaAgaci.js";
import { useGeoProfiller } from "../geoProfil.js";

// ============================================================
// Admin: 32 kişilik turnuva için 4 torbalı kura + ağaç yönetimi.
// Panel dört adımdan oluşur; her adım kendi kartında, kendi tek
// "Kaydet" butonuyla yönetilir. Üstteki durum şeridi yayın ve sayfa
// ayarlarını toplar.
//   1. Oyuncu profilleri (ad + GeoGuessr linki)
//   2. Torbalar (profil listesinden seçilerek, 4 × 8)
//   3. Kura (her basışta bir bölge; 8 basışta ağaç tamamlanır)
//   4. Ağaç (oyuncuya tıklayarak kazanan işaretlenir)
// ============================================================

const TORBA_BASLIK = ["Torba 1", "Torba 2", "Torba 3", "Torba 4"];
const TORBA_ARALIK = ["1-8", "9-16", "17-24", "25-32"];
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
  const [torbaListe, setTorbaListe] = useState([[], [], [], []]); // düzenlenen torbalar (kaydedilmemiş olabilir)
  const [elleAd, setElleAd] = useState(["", "", "", ""]);
  const [hata, setHata] = useState("");
  const [mesaj, setMesaj] = useState(""); // kısa süreli başarı bildirimi
  const [bekliyor, setBekliyor] = useState(false);
  const [sonBolge, setSonBolge] = useState(null); // animasyon: son çekilen bölge indeksi
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
      setTorbaListe(satir.torbalar);
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
    guncelle({ torbalar: torbaListe }, "Torbalar kaydedildi");
  }

  function torbalariGeriAl() {
    setTorbaListe(kayit.torbalar);
    setHata("");
  }

  // ---- Kura ----
  async function kuraCek(adet) {
    const onceki = kayit.bolgeler.length;
    const bolgeler = [...kayit.bolgeler];
    for (let i = 0; i < adet && bolgeler.length < BOLGE_SAYISI; i++) {
      const kalan = kalanOyuncular(kayit.torbalar, bolgeler);
      bolgeler.push(kalan.map((torba) => torba[Math.floor(Math.random() * torba.length)]));
    }
    const sonuc = await guncelle({ bolgeler }, null);
    // Tek bölge çekildiyse o bölgenin oyuncuları animasyonla belirir
    if (sonuc) {
      setSonBolge(adet === 1 ? onceki : null);
      setAcikBolum("agac");
    }
  }

  async function kurayiSifirla() {
    if (!window.confirm("Kura ve tüm maç sonuçları silinsin mi? Bu işlem geri alınamaz.")) return;
    setSonBolge(null);
    const sonuc = await guncelle({ bolgeler: [], sonuclar: {} }, "Kura sıfırlandı");
    if (sonuc) setAcikBolum("kura");
  }

  // ---- Ağaç ----
  function kazananSec(mac, oyuncu) {
    const sonuclar = { ...kayit.sonuclar };
    if (sonuclar[mac.id] === oyuncu) delete sonuclar[mac.id];
    else sonuclar[mac.id] = oyuncu;
    setSonBolge(null);
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
  const torbadakiler = torbaListe.flat();
  const secilebilir = Object.keys(kayitliProfiller).filter((ad) => !torbadakiler.includes(ad));
  const torbalarDegisti = JSON.stringify(torbaListe) !== JSON.stringify(kayit.torbalar);
  const profilsiz = torbaAdlari.filter((ad) => !kayitliProfiller[ad]);
  const fazlaProfil = Object.keys(kayitliProfiller).filter((ad) => torbaAdlari.length && !torbaAdlari.includes(ad));

  const kuraBasladi = kayit.bolgeler.length > 0;
  const kuraBitti = kayit.bolgeler.length >= BOLGE_SAYISI;
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
        <p className="kura-aciklama">
          Her satıra bir oyuncu: <code>Ad</code> + sekme/boşluk + <code>GeoGuessr profil linki</code>.
          Avatar, ülke ve lig bilgisi bu linkten çekilir; torbalar bu listeden doldurulur.
        </p>
        <textarea
          className="kura-metin"
          rows={10}
          value={profilMetni}
          placeholder={"DK\thttps://www.geoguessr.com/user/616dadb53ea44c00014582b8"}
          onChange={(e) => setProfilMetni(e.target.value)}
          spellCheck={false}
        />
        {(profilsiz.length > 0 || fazlaProfil.length > 0) && (
          <ul className="kura-notlar">
            {profilsiz.length > 0 && <li><b>Linki olmayanlar:</b> {profilsiz.join(", ")}</li>}
            {fazlaProfil.length > 0 && <li><b>Torbalarda olmayan adlar</b> (yazım farkı olabilir): {fazlaProfil.join(", ")}</li>}
          </ul>
        )}
      </Bolum>

      {/* ================= 2. Torbalar ================= */}
      <Bolum
        no={2}
        baslik="Torbalar"
        durum={
          kuraBasladi
            ? "Kura başladı · kilitli"
            : `${torbadakiler.length}/${TORBA_BOYU * 4} oyuncu${torbalarDegisti ? " · kaydedilmemiş değişiklik" : ""}`
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
        {kuraBasladi ? (
          <p className="kura-aciklama">Kura çekildiği için torbalar değiştirilemez. Değiştirmek için önce kurayı sıfırlayın.</p>
        ) : (
          <p className="kura-aciklama">
            Her torbaya {TORBA_BOYU} oyuncu seçin. Torba 1 ile 4, Torba 2 ile 3 ilk turda eşleşir.
            {profilSayisi === 0 && " Önce oyuncu profillerini kaydedin."}
          </p>
        )}
        <div className="kura-torbalar">
          {TORBA_BASLIK.map((baslik, p) => {
            const dolu = torbaListe[p].length >= TORBA_BOYU;
            return (
              <div key={baslik} className={`kura-torba${dolu ? " dolu" : ""}`}>
                <div className="kura-torba-ust">
                  <span className="kura-torba-ad">{baslik}</span>
                  <span className="kura-torba-sayi">{torbaListe[p].length}/{TORBA_BOYU} · sıra {TORBA_ARALIK[p]}</span>
                </div>
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
                  {torbaListe[p].length === 0 && <li className="kura-cip-bos">Boş</li>}
                </ul>
                {!kuraBasladi && !dolu && (
                  <div className="kura-ekle">
                    <select
                      className="kura-girdi"
                      value=""
                      onChange={(e) => torbayaEkle(p, e.target.value)}
                      disabled={secilebilir.length === 0}
                    >
                      <option value="">{secilebilir.length ? "Oyuncu ekle…" : "Listede oyuncu kalmadı"}</option>
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
            );
          })}
        </div>
      </Bolum>

      {/* ================= 3. Kura ================= */}
      <Bolum
        no={3}
        baslik="Kura"
        durum={
          kuraBitti
            ? "Tamamlandı"
            : kuraBasladi
              ? `${kayit.bolgeler.length}/${BOLGE_SAYISI} bölge çekildi`
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
              <button type="button" className="admin-mini" onClick={() => kuraCek(BOLGE_SAYISI)} disabled={bekliyor}>
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
        {!torbalarHazir ? (
          <p className="kura-aciklama">Kura için 4 torbanın da {TORBA_BOYU} oyuncuyla kaydedilmiş olması gerekir.</p>
        ) : kuraBitti ? (
          <p className="kura-aciklama">Tüm bölgeler çekildi. Ağaç aşağıda; yeniden çekmek için kurayı sıfırlayın.</p>
        ) : (
          <p className="kura-aciklama">
            Her "Kura Çek" basışı 4 torbadan birer oyuncu seçip sıradaki bölgeye koyar
            (sırada: <b>Bölge {kayit.bolgeler.length + 1}</b>). "Hepsini Çek" kalan bölgeleri tek seferde tamamlar.
          </p>
        )}
        <ol className="kura-bolgeler">
          {Array.from({ length: BOLGE_SAYISI }, (_, i) => {
            const b = kayit.bolgeler[i];
            return (
              <li key={i} className={`kura-bolge${b ? " cekildi" : ""}`}>
                <span className="kura-bolge-no">B{i + 1}</span>
                <span className="kura-bolge-ad">{b ? b.join(" · ") : "—"}</span>
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
          <>
            <p className="kura-aciklama">Kazananı işaretlemek için oyuncuya tıklayın; tekrar tıklarsanız işaret kalkar. Değişiklikler anında kaydedilir.</p>
            <AgacGorunum
              bolgeler={kayit.bolgeler}
              sonuclar={kayit.sonuclar}
              turAdlari={TUR_ADLARI}
              sampiyonEtiket="Şampiyon"
              onKazanan={kazananSec}
              yeniBolge={sonBolge}
            />
          </>
        ) : (
          <p className="kura-aciklama">Henüz kura çekilmedi.</p>
        )}
      </Bolum>
    </div>
  );
}
