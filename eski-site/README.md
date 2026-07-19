# GeoTürkiye — Topluluk Web Sitesi

GeoGuessr Türkiye Topluluğu'nun kurumsal web sitesi. Framework yok, derleme adımı yok —
saf HTML/CSS/JS. Herhangi bir statik barındırma hizmetinde çalışır.

## Dosya Yapısı

```
index.html          Ana sayfa (hero + Türkiye haritası, program, modlar sözlüğü)
hakkimizda.html     Hikâye, değerler, zaman çizelgesi, ekip
etkinlikler.html    Haftalık program, formatlar, katılım adımları
katil.html          Katılım rehberi, kurallar, SSS, iletişim
css/style.css       Tüm tasarım sistemi (renkler en üstteki :root bloğunda)
js/main.js          Mobil menü + kaydırma animasyonları
assets/favicon.svg  Site ikonu
```

## Yayına Almadan Önce Güncellenecekler

Tüm güncellenecek noktalar HTML içinde `<!-- GÜNCELLE: ... -->` yorumlarıyla işaretli.
Hızlı liste:

1. **Discord davet linki** — dört sayfada da `href="#"` olan Discord butonları.
   Tek komutla değiştirmek için tüm dosyalarda arama yapın: `GÜNCELLE: Discord`
2. **Sosyal medya linkleri** — footer'daki X / YouTube / Twitch bağlantıları
   (kullanmadıklarınızı silebilirsiniz).
3. **İletişim e-postası** — `iletisim@geoturkiye.com` geçici; kendi adresinizle değiştirin.
4. **Etkinlik programı** — `index.html` ve `etkinlikler.html` içindeki tablo satırları örnektir.
5. **Hakkımızda** — hikâye ve zaman çizelgesini topluluğunuzun gerçek tarihiyle zenginleştirin.

## Renkleri / Yazı Tiplerini Değiştirme

`css/style.css` dosyasının en üstündeki `:root` bloğu tüm paleti kontrol eder:

- `--red` → vurgu rengi (bayrak kırmızısı `#E30A17`)
- `--paper` / `--ink` → zemin ve metin
- Yazı tipleri Google Fonts'tan geliyor: Space Grotesk (başlık),
  DM Sans (metin), JetBrains Mono (etiket/koordinat).

## Türkiye Haritası

Ana sayfadaki harita, gerçek enlem/boylam koordinatlarından üretilmiş satır içi bir SVG'dir.
Pin eklemek/değiştirmek için `index.html` içinde `map-pins` grubunu bulun; her pin
`translate(x y)` ile konumlanır. Formül: `x = (boylam − 25.6) × 78`, `y = (42.6 − enlem) × 100`.

## Yayınlama

Site statik olduğu için en kolay yollar:

- **Netlify** (netlify.com) → klasörü sürükle-bırak, ücretsiz.
- **GitHub Pages** → depoya yükleyin, Settings → Pages'ten yayınlayın.
- **Cloudflare Pages** → Türkiye'den hızlı erişim için iyi bir seçenek.

Özel alan adını (ör. geoturkiye.com) bu hizmetlerin panelinden bağlayabilirsiniz.
