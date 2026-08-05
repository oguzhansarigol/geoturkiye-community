// ============================================================
// 32 kişilik single elimination turnuva ağacı — ortak mantık.
// 4 torbalı kura: her bölgeye her torbadan tam 1 oyuncu düşer.
// İlk tur eşleşmeleri: Torba 1 vs Torba 4 ve Torba 2 vs Torba 3.
//
// Veri modeli (Supabase turnuva_agaclari tablosu):
//   torbalar : [[8 ad], [8 ad], [8 ad], [8 ad]]
//   bolgeler : [[torba1, torba2, torba3, torba4], ...] (en fazla 8)
//   sonuclar : { "r1-0": "kazanan adı", ... }
// Maç kimlikleri: r1-0..15, r2-0..7, qf-0..3, sf-0..1, f-0
// ============================================================

export const TUR_SIRASI = ["r1", "r2", "qf", "sf", "f"];
export const BOLGE_SAYISI = 8;
export const TORBA_SAYISI = 4;
export const TORBA_BOYU = 8;

// Kayıtlı kazanan, maçın gerçek katılımcılarından biriyse geçerlidir.
// Böylece önceki tur sonucu değiştiğinde eski (artık geçersiz) sonuçlar
// kendiliğinden yok sayılır; ayrıca temizlik gerekmez.
function gecerliKazanan(mac, sonuclar) {
  const k = sonuclar[mac.id];
  return k && mac.ust && mac.alt && (k === mac.ust || k === mac.alt) ? k : null;
}

// bolgeler + sonuclar'dan tüm turların maç listesini üretir:
// { r1: [{id, ust, alt, kazanan}], r2: [...], qf: [...], sf: [...], f: [...] }
export function maclariHesapla(bolgeler, sonuclar) {
  const b = bolgeler || [];
  const s = sonuclar || {};
  const turlar = {};

  // İlk tur: bölge i → maç 2i (Torba 1 vs Torba 4), maç 2i+1 (Torba 2 vs Torba 3)
  turlar.r1 = Array.from({ length: BOLGE_SAYISI * 2 }, (_, m) => {
    const bolge = b[Math.floor(m / 2)];
    return {
      id: `r1-${m}`,
      ust: bolge ? (m % 2 === 0 ? bolge[0] : bolge[1]) : null,
      alt: bolge ? (m % 2 === 0 ? bolge[3] : bolge[2]) : null,
    };
  });

  let onceki = turlar.r1;
  for (const tur of TUR_SIRASI.slice(1)) {
    turlar[tur] = Array.from({ length: onceki.length / 2 }, (_, m) => ({
      id: `${tur}-${m}`,
      ust: gecerliKazanan(onceki[2 * m], s),
      alt: gecerliKazanan(onceki[2 * m + 1], s),
    }));
    onceki = turlar[tur];
  }

  for (const tur of TUR_SIRASI) {
    for (const mac of turlar[tur]) mac.kazanan = gecerliKazanan(mac, s);
  }
  return turlar;
}

// Torbalardan henüz kuraya girmemiş (bolgeler'de olmayan) oyuncular
export function kalanOyuncular(torbalar, bolgeler) {
  return torbalar.map((torba, p) =>
    torba.filter((oyuncu) => !bolgeler.some((bolge) => bolge[p] === oyuncu))
  );
}
