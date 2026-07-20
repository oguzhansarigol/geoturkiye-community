import { useEffect, useState } from "react";
import Page from "../components/Page.jsx";
import Btn from "../components/Btn.jsx";
import { supabase } from "../supabase.js";

// ============================================================
// Admin paneli (/admin) — sadece Türkçe.
// Giriş: Supabase Auth (e-posta/şifre). Hesaplar Supabase
// Dashboard > Authentication > Users bölümünden elle eklenir.
// ============================================================

const DURUM_ETIKET = { taslak: "Taslak", acik: "Açık", kapali: "Kapalı" };
const BASVURU_ETIKET = { bekliyor: "Bekliyor", onaylandi: "Onaylandı", reddedildi: "Reddedildi" };

const BOS_TURNUVA = { ad: "", aciklama: "", format: "", tarih: "", max_katilimci: "", durum: "taslak" };

function Giris({ onGiris }) {
  const [eposta, setEposta] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState("");
  const [bekliyor, setBekliyor] = useState(false);

  async function girisYap(e) {
    e.preventDefault();
    setHata("");
    setBekliyor(true);
    const { error } = await supabase.auth.signInWithPassword({ email: eposta, password: sifre });
    setBekliyor(false);
    if (error) setHata("Giriş başarısız: e-posta veya şifre hatalı.");
    else onGiris();
  }

  return (
    <form className="t-form admin-giris" onSubmit={girisYap}>
      <h2>Admin Girişi</h2>
      <div className="t-form-grid">
        <label>
          <span>E-posta</span>
          <input type="email" required value={eposta} onChange={(e) => setEposta(e.target.value)} />
        </label>
        <label>
          <span>Şifre</span>
          <input type="password" required value={sifre} onChange={(e) => setSifre(e.target.value)} />
        </label>
      </div>
      {hata && <p className="form-hata" role="alert">{hata}</p>}
      <Btn type="submit" kind="ink" disabled={bekliyor}>{bekliyor ? "Giriş yapılıyor…" : "Giriş Yap"}</Btn>
    </form>
  );
}

function TurnuvaFormu({ kayit, onKaydet, onIptal }) {
  const [form, setForm] = useState(kayit || BOS_TURNUVA);
  const [bekliyor, setBekliyor] = useState(false);
  const [hata, setHata] = useState("");

  function alan(ad) {
    return (e) => setForm((f) => ({ ...f, [ad]: e.target.value }));
  }

  async function kaydet(e) {
    e.preventDefault();
    setHata("");
    setBekliyor(true);
    const veri = {
      ad: form.ad.trim(),
      aciklama: form.aciklama.trim(),
      format: form.format.trim(),
      tarih: form.tarih.trim(),
      max_katilimci: form.max_katilimci === "" || form.max_katilimci === null ? null : Number(form.max_katilimci),
      durum: form.durum,
    };
    const sorgu = form.id
      ? supabase.from("turnuvalar").update(veri).eq("id", form.id)
      : supabase.from("turnuvalar").insert(veri);
    const { error } = await sorgu;
    setBekliyor(false);
    if (error) setHata("Kaydedilemedi: " + error.message);
    else onKaydet();
  }

  return (
    <form className="t-form admin-t-form" onSubmit={kaydet}>
      <div className="t-form-grid">
        <label>
          <span>Turnuva adı *</span>
          <input type="text" required maxLength={120} value={form.ad} onChange={alan("ad")} />
        </label>
        <label>
          <span>Format</span>
          <input type="text" maxLength={80} placeholder="örn. Çevrim içi • Tekler" value={form.format} onChange={alan("format")} />
        </label>
        <label>
          <span>Tarih</span>
          <input type="text" maxLength={80} placeholder="örn. 12.09.2026 21:00" value={form.tarih} onChange={alan("tarih")} />
        </label>
        <label>
          <span>Kontenjan (boş = sınırsız)</span>
          <input type="number" min="1" value={form.max_katilimci ?? ""} onChange={alan("max_katilimci")} />
        </label>
        <label>
          <span>Durum</span>
          <select value={form.durum} onChange={alan("durum")}>
            {Object.entries(DURUM_ETIKET).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label className="t-form-genis">
          <span>Açıklama</span>
          <textarea rows={3} maxLength={2000} value={form.aciklama} onChange={alan("aciklama")} />
        </label>
      </div>
      {hata && <p className="form-hata" role="alert">{hata}</p>}
      <div className="admin-satir">
        <Btn type="submit" kind="ink" disabled={bekliyor}>{bekliyor ? "Kaydediliyor…" : "Kaydet"}</Btn>
        <Btn kind="ghost" onClick={onIptal}>Vazgeç</Btn>
      </div>
    </form>
  );
}

function Basvurular({ turnuva }) {
  const [liste, setListe] = useState(null);

  async function yukle() {
    const { data } = await supabase
      .from("basvurular")
      .select("*")
      .eq("turnuva_id", turnuva.id)
      .order("created_at", { ascending: true });
    setListe(data || []);
  }

  useEffect(() => { yukle(); }, [turnuva.id]);

  async function durumDegistir(id, durum) {
    await supabase.from("basvurular").update({ durum }).eq("id", id);
    yukle();
  }

  async function sil(id) {
    if (!window.confirm("Bu başvuru silinsin mi?")) return;
    await supabase.from("basvurular").delete().eq("id", id);
    yukle();
  }

  if (!liste) return <p className="t-day">Başvurular yükleniyor…</p>;
  if (liste.length === 0) return <p className="t-day">Bu turnuvaya henüz başvuru yok.</p>;

  return (
    <div className="table-scroll">
      <table className="fixture admin-tablo">
        <thead>
          <tr>
            <th>Discord</th><th>Oyun profili</th><th>Ad Soyad</th><th>Tarih</th><th>Durum</th><th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {liste.map((b) => (
            <tr key={b.id}>
              <td><div className="t-name">{b.discord_kullanici}</div></td>
              <td>
                <a className="admin-link" href={b.oyun_profili} target="_blank" rel="noopener">
                  {b.oyun_profili.replace(/^https?:\/\//, "").slice(0, 40)}
                </a>
              </td>
              <td>{b.ad_soyad || "—"}</td>
              <td className="t-day">{new Date(b.created_at).toLocaleDateString("tr-TR")}</td>
              <td><span className={`tag basvuru-${b.durum}`}>{BASVURU_ETIKET[b.durum]}</span></td>
              <td className="admin-islemler">
                {b.durum !== "onaylandi" && (
                  <button className="admin-mini onay" onClick={() => durumDegistir(b.id, "onaylandi")}>Onayla</button>
                )}
                {b.durum !== "reddedildi" && (
                  <button className="admin-mini red" onClick={() => durumDegistir(b.id, "reddedildi")}>Reddet</button>
                )}
                {b.durum !== "bekliyor" && (
                  <button className="admin-mini" onClick={() => durumDegistir(b.id, "bekliyor")}>Beklet</button>
                )}
                <button className="admin-mini" onClick={() => sil(b.id)}>Sil</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Panel({ onCikis }) {
  const [turnuvalar, setTurnuvalar] = useState(null);
  const [duzenlenen, setDuzenlenen] = useState(null); // null | "yeni" | turnuva kaydı
  const [acikBasvuru, setAcikBasvuru] = useState(null); // başvuruları gösterilen turnuva id

  async function yukle() {
    const { data } = await supabase
      .from("turnuvalar")
      .select("*")
      .order("created_at", { ascending: false });
    setTurnuvalar(data || []);
  }

  useEffect(() => { yukle(); }, []);

  async function turnuvaSil(t) {
    if (!window.confirm(`"${t.ad}" ve tüm başvuruları silinsin mi? Bu işlem geri alınamaz.`)) return;
    await supabase.from("turnuvalar").delete().eq("id", t.id);
    yukle();
  }

  return (
    <div className="admin-panel">
      <div className="admin-ust">
        <h2>Turnuva Yönetimi</h2>
        <div className="admin-satir">
          {duzenlenen === null && (
            <Btn kind="red" onClick={() => setDuzenlenen("yeni")}>+ Yeni Turnuva</Btn>
          )}
          <Btn kind="ghost" onClick={onCikis}>Çıkış</Btn>
        </div>
      </div>

      {duzenlenen === "yeni" && (
        <TurnuvaFormu onKaydet={() => { setDuzenlenen(null); yukle(); }} onIptal={() => setDuzenlenen(null)} />
      )}

      {!turnuvalar && <p className="t-day">Yükleniyor…</p>}
      {turnuvalar && turnuvalar.length === 0 && duzenlenen !== "yeni" && (
        <p className="t-day">Henüz turnuva yok. "+ Yeni Turnuva" ile ilkini oluşturun.</p>
      )}

      {turnuvalar?.map((t) =>
        duzenlenen && duzenlenen !== "yeni" && duzenlenen.id === t.id ? (
          <TurnuvaFormu
            key={t.id}
            kayit={t}
            onKaydet={() => { setDuzenlenen(null); yukle(); }}
            onIptal={() => setDuzenlenen(null)}
          />
        ) : (
          <div className="t-kart" key={t.id}>
            <div className="t-kart-ust">
              <div>
                <h3 className="t-kart-ad">{t.ad}</h3>
                <p className="t-kart-meta">
                  <span className={`tag turnuva-${t.durum}`}>{DURUM_ETIKET[t.durum]}</span>
                  {t.format && <span className="tag">{t.format}</span>}
                  {t.tarih && <span className="t-day">{t.tarih}</span>}
                  <span className="t-day">Kontenjan: {t.max_katilimci ?? "Sınırsız"}</span>
                </p>
              </div>
              <div className="admin-satir">
                <button className="admin-mini" onClick={() => setDuzenlenen(t)}>Düzenle</button>
                <button
                  className="admin-mini onay"
                  onClick={() => setAcikBasvuru(acikBasvuru === t.id ? null : t.id)}
                >
                  {acikBasvuru === t.id ? "Başvuruları Gizle" : "Başvurular"}
                </button>
                <button className="admin-mini red" onClick={() => turnuvaSil(t)}>Sil</button>
              </div>
            </div>
            {acikBasvuru === t.id && <Basvurular turnuva={t} />}
          </div>
        )
      )}
    </div>
  );
}

export default function Admin() {
  const [oturum, setOturum] = useState(undefined); // undefined = kontrol ediliyor

  useEffect(() => {
    if (!supabase) { setOturum(null); return; }
    supabase.auth.getSession().then(({ data }) => setOturum(data.session));
    const { data: dinleyici } = supabase.auth.onAuthStateChange((_e, session) => setOturum(session));
    return () => dinleyici.subscription.unsubscribe();
  }, []);

  async function cikis() {
    await supabase.auth.signOut();
  }

  return (
    <Page title="Admin" description="GeoGuessrTürkiye yönetim paneli.">
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Yönetim</p>
          <h1>Admin Paneli</h1>
        </div>
        <span className="page-coords">ERİŞİM: SADECE YETKİLİ</span>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          {!supabase && (
            <p className="form-hata">
              Supabase yapılandırılmamış. Kurulum için proje kökündeki KURULUM-SUPABASE.md dosyasına bakın.
            </p>
          )}
          {supabase && oturum === undefined && <p className="t-day">Oturum kontrol ediliyor…</p>}
          {supabase && oturum === null && <Giris onGiris={() => {}} />}
          {supabase && oturum && <Panel onCikis={cikis} />}
        </div>
      </section>
    </Page>
  );
}
