# GeoGuessrTürkiye — Topluluk Web Sitesi (React)

GeoGuessr Türkiye Topluluğu'nun kurumsal web sitesi (marka: GeoGuessrTürkiye,
domain: geoturkiye.community).
**Vite + React + React Router + Motion** (sayfa geçişleri ve animasyonlar) ile yazılmıştır.
Font: **Google Sans Flex** (metin) + **Google Sans Code** (mono etiketler) — Google Fonts'tan.

## Çalıştırma

```bash
npm install        # ilk kurulumda bir kez
npm run dev        # geliştirme sunucusu → http://localhost:5173
npm run build      # yayın dosyalarını dist/ klasörüne üretir
npm run preview    # dist/ çıktısını yerelde test eder
```

İpucu: Adrese `?noanim` eklersen (ör. `localhost:5173/?noanim`) tüm giriş
animasyonları atlanır — tasarımı hızlıca kontrol etmek için kullanışlı.

## Dosya Yapısı

```
index.html                  Giriş HTML'i (font bağlantıları burada)
src/config.js               Discord linki, e-posta, sosyal medya (tek yerden)
src/metinler.jsx            ⭐ TÜM SİTE METİNLERİ (Türkçe + İngilizce)
src/i18n.jsx                Dil durumu (TR/EN toggle altyapısı)
src/pages/                  Sayfalar: Home, Hakkimizda, Etkinlikler, Kulupler,
                            FaydaliSiteler, Katil
src/components/             Header, Footer, LiveMap (canlı harita), Ticker,
                            AnimatedTopo (hero'daki canlı kontur katmanı), Reveal
src/ses.js                  Tık sesleri (kapatmak için tarayıcı konsolunda:
                            localStorage.setItem("ggtr-ses", "0"))
src/styles/global.css       Tüm tasarım sistemi (renkler en üstteki :root bloğunda)
public/logo.png             Site logosu (ay-yıldızlı pin)
public/                     favicon + Netlify yönlendirme dosyası (_redirects)
eski-site/                  Önceki statik sürümün yedeği (silinebilir)
```

## Dil Sistemi (TR/EN)

- Sağ üstteki TR/EN düğmesi dili değiştirir; seçim tarayıcıda hatırlanır.
- Bir metni değiştirmek için `src/metinler.jsx` içinde hem `tr` hem `en`
  bölümündeki ilgili satırı düzenleyin.
- Test için adrese `?dil=en` veya `?dil=tr` ekleyebilirsiniz.

## Güvenlik

`public/_headers` dosyası Netlify ve Cloudflare Pages'te otomatik uygulanır:

- **Content-Security-Policy**: yalnızca kendi kodumuz + Google Fonts +
  CARTO harita karoları çalışır; yabancı script enjeksiyonu engellenir.
- **X-Frame-Options / frame-ancestors**: site başka sitelere iframe olarak
  gömülemez (clickjacking koruması).
- **nosniff, Referrer-Policy, Permissions-Policy, HSTS, COOP** ayarlı.
- Vercel kullanılacaksa aynı başlıklar `vercel.json` içine taşınmalıdır.

## SEO

- Sayfa başlıkları ve açıklamaları her sayfada otomatik ayarlanır
  (`src/components/Page.jsx` üzerinden `title` ve `description`).
- `public/robots.txt` ve `public/sitemap.xml` hazır (geoturkiye.community
  adresine göre yazıldı).
- `index.html` içinde Organization JSON-LD, Open Graph ve Twitter kartları var.
- Domain aktif olunca `index.html` içindeki canonical/og:url satırlarının
  yorumunu kaldırın; og:image için tam adres kullanın
  (https://geoturkiye.community/logo.png).

## Topografya Deseni

Üç varyant `public/` içinde: `topo.svg` (kâğıt zemin), `topo-white.svg`
(kırmızı CTA bandı), `topo-dark.svg` (koyu bölümler). Hero, iç sayfa
başlıkları, CTA bandı, koyu bölümler ve Kulüpler panelinde kullanılıyor.

## İçerik Kuralları

- Metinlerde uzun tire (—) kullanılmaz; onun yerine iki nokta, noktalı virgül
  veya orta nokta (·) tercih edilir.

## Yayına Almadan Önce Güncellenecekler

1. **`src/config.js`** içinde e-posta ve sosyal medya linkleri (Discord daveti ayarlı:
   discord.gg/JqxyV9PxdV). Sitedeki bütün Discord butonları bu dosyadan beslenir.
2. **`src/pages/Hakkimizda.jsx`** hikâye ve kilometre taşlarını gerçek tarihlerle
   doldurun (`GÜNCELLE` yorumlarıyla işaretli).
3. Haftalık program netleşince: Home'daki "Program: Hazırlanıyor" panelini ve
   Etkinlikler'deki inşaat bölümünü gerçek takvimle değiştirin.
4. `src/metinler.jsx` içinde geçmiş turnuvalar tablosunda 3. turnuvanın ve
   offline turnuvanın tarihleri "Tarih eklenecek" olarak duruyor; iki dilde de
   gerçek tarihlerle güncelleyin.

## Kulüpler

Üç GeoGuessr kulübü sayfada kartlar hâlinde listeleniyor (ana kulüp + 2 kardeş
kulüp). Kulüp adları, açıklamaları ve bağlantıları `src/metinler.jsx` içindeki
`kulupler.liste` dizisinden (tr + en) düzenlenir; logo `public/kulup-logo.png`.
Yeni kulüp eklemek için diziye satır eklemek yeterli.

## Faydalı Siteler

`src/pages/FaydaliSiteler.jsx` içindeki `SITELER` dizisini düzenleyerek
listeye kaynak ekleyip çıkarabilirsiniz (ad, url, host, açıklama).

## Tasarımı Özelleştirme

`src/styles/global.css` en üstündeki `:root` bloğu:

- `--red` → vurgu rengi (bayrak kırmızısı `#E30A17`)
- `--paper` / `--ink` → zemin ve metin renkleri
- Fontlar `index.html` içindeki Google Fonts bağlantısından gelir.

## Canlı Harita

Ana sayfadaki beyaz tonlu harita `src/components/LiveMap.jsx` içindedir
(Leaflet + CARTO Light altlığı; API anahtarı gerektirmez, Google Maps'in açık
temasına çok yakın görünür). Şehir pini eklemek için `SEHIRLER` dizisine satır
ekleyin. İleride gerçek Google Maps istenirse: Google Cloud'dan Maps JavaScript
API anahtarı alınıp bu bileşen değiştirilebilir (anahtar faturalandırma hesabı ister).

Not: Eski çizim animasyonlu SVG Türkiye haritası `src/components/TurkeyMap.jsx`
dosyasında duruyor; kullanılmıyor ama istenirse geri takılabilir.

## Yayınlama

`npm run build` sonrası çıkan **dist/** klasörünü yükleyin:

- **Netlify** → sürükle-bırak; `public/_redirects` dosyası router için hazır.
- **Vercel** → depoyu bağlayın, framework "Vite" seçin; SPA yönlendirmesini otomatik yapar.
- **Cloudflare Pages** → build komutu `npm run build`, çıktı klasörü `dist`.
  SPA yönlendirmesi için panelden "Single Page Application" modunu seçin.

Alan adı: **geoturkiye.community** (alındığında bu hizmetlerin panelinden bağlanır).
Domain aktif olunca `index.html` içindeki canonical/og:url satırlarının
yorumunu kaldırmayı unutmayın.
