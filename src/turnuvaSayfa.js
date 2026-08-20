import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase.js";
import { useGeoProfiller } from "./geoProfil.js";
import { maclariHesapla } from "./turnuvaAgaci.js";
import { TURNUVA_SAYFA_YOLU } from "./config.js";

// ============================================================
// Turnuva sayfası (/turnuva/:kimlik) ve canlı izleme sayfası için
// ortak veri katmanı: yayındaki ağacı Supabase'den çeker, oyuncu
// listesini ve GeoGuessr profillerini (avatar, ülke, lig) hazırlar.
// kimlik: ağaç slug'ı ya da turnuva id'si (uuid)
// ============================================================

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SECIM = "turnuva_id, slug, torbalar, bolgeler, sonuclar, oyuncular, yayin_url, turnuvalar!inner(ad, aciklama, format, tarih, katilim)";

// Turnuvanın sayfa adresi (slug varsa onu, yoksa id'yi kullanır)
export function turnuvaYolu(agac, canli = false) {
  return `/turnuva/${agac.slug || agac.turnuva_id}${canli ? "/canli" : ""}`;
}

// Ana sayfadaki "Turnuva Ağacı" tuşunun adresi: yayındaki ağacı
// Supabase'den bulur; slug elle yazılmış config yoluyla uyuşmasa da
// link doğru sayfaya gider. Yüklenene kadar / yayında ağaç yoksa
// config'teki yol kullanılır.
export function useYayindakiTurnuvaYolu() {
  const [yol, setYol] = useState(TURNUVA_SAYFA_YOLU);
  useEffect(() => {
    if (!supabase) return;
    let iptal = false;
    supabase
      .from("turnuva_agaclari")
      .select("slug, turnuva_id")
      .eq("yayinda", true)
      .limit(1)
      .then(({ data, error }) => {
        if (!iptal && !error && data?.[0]) setYol(turnuvaYolu(data[0]));
      });
    return () => { iptal = true; };
  }, []);
  return yol;
}

// Oyuncu adları: önce torbalar (torba sırasıyla 1 → 4), sonra kura
// bölgeleri, en son profil listesindeki (oyuncular) adlar — böylece
// torbalar henüz yazılmamışken de profil listesi sayfada görünür.
// Her ad bir kez geçer.
export function oyuncuAdlari(agac) {
  return [...new Set([
    ...(agac.torbalar || []).flat(),
    ...(agac.bolgeler || []).flat(),
    ...Object.keys(agac.oyuncular || {}),
  ].filter(Boolean))];
}

// YouTube linkini gömülebilir adrese çevirir; çevrilemezse null.
// Desteklenen biçimler: youtu.be/ID, watch?v=ID, /live/ID, /embed/ID,
// /channel/UC… (kanalın aktif canlı yayını)
export function yayinGomme(url) {
  if (!url) return null;
  let u;
  try { u = new URL(url); } catch { return null; }
  const host = u.hostname.replace(/^www\.|^m\./, "");
  if (host === "youtu.be") {
    const id = u.pathname.slice(1).split("/")[0];
    return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1` : null;
  }
  if (host !== "youtube.com" && host !== "youtube-nocookie.com") return null;
  const v = u.searchParams.get("v");
  if (v) return `https://www.youtube-nocookie.com/embed/${v}?autoplay=1`;
  const m = /^\/(?:live|embed|shorts)\/([A-Za-z0-9_-]{6,})/.exec(u.pathname);
  if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1`;
  const k = /^\/channel\/(UC[A-Za-z0-9_-]+)/.exec(u.pathname);
  if (k) return `https://www.youtube-nocookie.com/embed/live_stream?channel=${k[1]}&autoplay=1`;
  return null;
}

// Admin panelinde yapılan değişiklikler (kura, sonuçlar) izleyiciye
// sayfa yenilemeden ulaşsın diye bu aralıkla yeniden çekilir.
const YENILEME_MS = 30000;

// durum: "yukleniyor" | "yok" | "hazir"
export function useTurnuvaSayfasi(kimlik) {
  const [agac, setAgac] = useState(undefined); // undefined = yükleniyor, null = yok

  useEffect(() => {
    if (!supabase || !kimlik) { setAgac(null); return; }
    let iptal = false;
    setAgac(undefined);

    async function getir() {
      const sorgu = supabase.from("turnuva_agaclari").select(SECIM).eq("yayinda", true);
      const { data, error } = await (UUID_RE.test(kimlik)
        ? sorgu.eq("turnuva_id", kimlik)
        : sorgu.eq("slug", kimlik)
      ).maybeSingle();
      if (iptal || error) return;
      // İçerik değişmediyse state'i elleme (gereksiz yeniden çizim olmasın)
      setAgac((onceki) =>
        onceki && data && JSON.stringify(onceki) === JSON.stringify(data) ? onceki : data || null
      );
    }

    getir();
    const zamanlayici = setInterval(() => {
      if (document.visibilityState === "visible") getir();
    }, YENILEME_MS);
    const gorunurluk = () => { if (document.visibilityState === "visible") getir(); };
    document.addEventListener("visibilitychange", gorunurluk);
    return () => {
      iptal = true;
      clearInterval(zamanlayici);
      document.removeEventListener("visibilitychange", gorunurluk);
    };
  }, [kimlik]);

  const adlar = useMemo(() => (agac ? oyuncuAdlari(agac) : []), [agac]);
  const profilMap = agac?.oyuncular || {};
  const urller = useMemo(
    () => [...new Set(adlar.map((ad) => profilMap[ad]).filter(Boolean))],
    [adlar, profilMap]
  );
  const profiller = useGeoProfiller(urller);

  // Ad → { ad, profilUrl, profil } ; avatarlar: ad → görsel url
  const oyuncular = useMemo(
    () => adlar.map((ad) => ({ ad, profilUrl: profilMap[ad] || null, profil: profiller[profilMap[ad]] || null })),
    [adlar, profilMap, profiller]
  );
  const avatarlar = useMemo(() => {
    const m = {};
    for (const o of oyuncular) if (o.profil?.avatar) m[o.ad] = o.profil.avatar;
    return m;
  }, [oyuncular]);
  const turlar = useMemo(() => (agac ? maclariHesapla(agac.bolgeler, agac.sonuclar) : null), [agac]);

  return {
    durum: agac === undefined ? "yukleniyor" : agac === null ? "yok" : "hazir",
    agac,
    turnuva: agac?.turnuvalar || null,
    oyuncular,
    avatarlar,
    turlar,
  };
}
