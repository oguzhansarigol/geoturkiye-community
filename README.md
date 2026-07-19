# GeoGuessrTürkiye

GeoGuessr Türkiye Topluluğu'nun resmi web sitesi. Turnuvalar, kulüpler,
rehberler ve topluluk duyuruları için tek adres.

- Site: https://geoturkiye.community
- Discord: https://discord.gg/JqxyV9PxdV

Bağımsız bir topluluk projesidir; GeoGuessr AB ile resmi bir bağı yoktur.

## Özellikler

- Türkçe ve İngilizce tam çeviri, sağ üstten anlık dil değişimi
- Canlı harita: CARTO Voyager altlığı, şehir pinleri ve Türkiye sınırları
  içinde rastgele beliren "canlı tahmin" noktaları (API anahtarı gerektirmez)
- Sayfa geçişleri ve kaydırma animasyonları (Motion), hareket azaltma
  tercihine tam saygı
- Kartografik tasarım dili: topografya desenleri, koordinat etiketleri,
  Google Sans Flex ve Google Sans Code
- SEO hazır: sayfa bazlı başlık ve açıklamalar, Open Graph, JSON-LD,
  robots.txt, sitemap.xml
- Güvenlik başlıkları: CSP, HSTS, X-Frame-Options ve diğerleri
  (public/_headers)
- Kısık seviyede arayüz tık sesleri (Web Audio, ses dosyası yok)

## Teknolojiler

Vite, React 19, React Router 7, Motion (Framer Motion), Leaflet.

## Kurulum

Node.js 20 veya üzeri gerekir.

```bash
npm install        # bağımlılıkları kur
npm run dev        # geliştirme sunucusu: http://localhost:5173
npm run build      # üretim çıktısını dist/ klasörüne al
npm run preview    # dist/ çıktısını yerelde dene
```

Yardımcı adres parametreleri:

- `?dil=en` veya `?dil=tr`: dili zorla (normalde sağ üstteki TR/EN
  düğmesi kullanılır, tercih tarayıcıda saklanır)
- `?noanim`: tüm giriş animasyonlarını atla (tasarım kontrolü için)

## Proje Yapısı

```
index.html              Giriş HTML'i, font bağlantıları ve meta etiketler
src/metinler.jsx        Tüm site metinleri (Türkçe + İngilizce)
src/config.js           Discord daveti, e-posta, sosyal medya bağlantıları
src/i18n.jsx            Dil durumu ve TR/EN geçişi
src/ses.js              Arayüz tık sesleri
src/pages/              Sayfalar: Home, Hakkimizda, Etkinlikler, Kulupler,
                        FaydaliSiteler, Katil
src/components/         Header, Footer, LiveMap, AnimatedTopo, Ticker,
                        Reveal, CtaBand ve diğerleri
src/styles/global.css   Tasarım sistemi (renk ve font değişkenleri en üstte)
public/                 Logo, favicon, topografya desenleri, site ikonları,
                        robots.txt, sitemap.xml, _headers, _redirects
```

## İçerik Güncelleme

Sitedeki bütün yazılar `src/metinler.jsx` dosyasında durur ve her metnin
Türkçe (`tr`) ile İngilizce (`en`) karşılığı vardır. Bir metni değiştirirken
iki bölümü de güncelleyin.

Sık yapılan işlemler:

- Bağlantılar: `src/config.js` (Discord daveti buradan tüm butonlara dağılır)
- Kulüp kartları: `metinler.jsx` içinde `kulupler.liste`
- Faydalı siteler: `metinler.jsx` içinde `faydali.siteler`; yeni site
  eklerken ikonunu `public/ikonlar/<alanadi>.png` olarak koyun
- Geçmiş turnuvalar: `metinler.jsx` içinde `etkinlikler.gecmis`
- Haritadaki şehir pinleri: `src/components/LiveMap.jsx` içinde `SEHIRLER`

Yazım kuralı: metinlerde uzun tire (—) kullanılmaz; iki nokta, noktalı
virgül veya orta nokta (·) tercih edilir.

## Yayınlama

`npm run build` sonrası oluşan `dist/` klasörü herhangi bir statik
barındırma hizmetine yüklenebilir.

- Netlify ve Cloudflare Pages: `public/_redirects` (SPA yönlendirmesi) ve
  `public/_headers` (güvenlik başlıkları) otomatik uygulanır.
- Vercel: SPA yönlendirmesini otomatik yapar; güvenlik başlıklarını
  `vercel.json` içine taşımanız gerekir.
- Domain aktif olduğunda `index.html` içindeki canonical ve og:url
  satırlarının yorumunu kaldırın.

## Katkı

Hata bildirimi ve katkı için issue veya pull request açabilirsiniz.
Toplulukla iletişim için Discord sunucumuza bekleriz.

## Lisans

MIT. Ayrıntılar için LICENSE dosyasına bakın. Logo ve topluluk görselleri
GeoGuessrTürkiye topluluğuna aittir.
