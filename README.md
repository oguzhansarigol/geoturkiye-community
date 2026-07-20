# GeoGuessrTürkiye

Türkiye'nin GeoGuessr topluluğunun resmî web sitesi. Turnuvalar, kulüpler,
rehberler ve topluluk duyuruları için tek adres.

- **Site:** https://geoturkiye.community
- **Discord:** https://discord.gg/JqxyV9PxdV

> GeoGuessrTürkiye bağımsız bir topluluk oluşumudur; GeoGuessr AB ile
> resmî bir bağı yoktur.

## Bu site nedir?

GeoGuessrTürkiye, GeoGuessr oynayan Türkçe konuşan oyuncuları bir araya
getiren bir topluluktur. Bu site topluluğun vitrinidir ve şunları sağlar:

- **Etkinlikler ve turnuvalar:** Aktif turnuvalar sitede listelenir;
  oyuncular üyelik gerekmeden Discord kullanıcı adı ve GeoGuessr
  profiliyle başvuru yapar. Sonuçlar ve duyurular Discord üzerinden paylaşılır.
- **Kulüpler:** GeoGuessr üzerindeki resmî topluluk kulüpleri tek sayfada;
  kontenjan dolduğunda sıraya girmek için site üzerinden başvuru bırakılır.
- **Katılım rehberi:** Topluluğa katılma adımları, kurallar ve sık
  sorulan sorular.
- **Faydalı kaynaklar:** Meta öğrenmekten harita yapmaya, topluluğun
  güvendiği araçların derli toplu listesi.
- **Yönetim paneli:** Turnuva oluşturma ve başvuru değerlendirme,
  yalnızca yetkili yöneticilerin girebildiği bir panelden yürütülür.
  Başvurulardaki oyuncu profilleri lig ve düello istatistikleriyle
  zenginleştirilir.

Site Türkçe ve İngilizce olarak tam çeviriyle sunulur; dil sağ üstten
anlık değiştirilebilir.

## Nasıl çalışır?

Site, Vercel üzerinde barınan bir React (Vite) uygulamasıdır. Başvuru
sistemi Supabase (Postgres) kullanır; GeoGuessr profil bilgileri küçük
bir sunucu fonksiyonu üzerinden, halka açık verilerden okunur.

Veri güvenliği veritabanı katmanında, satır bazlı güvenlik (RLS)
kurallarıyla sağlanır:

- Ziyaretçiler yalnızca yayınlanmış turnuvaları görebilir ve açık
  turnuvalara başvuru ekleyebilir.
- Başvuruların içeriğini yalnızca giriş yapmış yöneticiler görebilir ve
  değerlendirebilir. Siteden yönetici hesabı açılamaz.
- Mükerrer başvurular ve kontenjan aşımı sunucu tarafında engellenir.



## Kendi kopyanı çalıştırmak

Node.js 20+ gerekir.

```bash
npm install
cp .env.local.example .env.local   # Supabase anahtarlarını gir
npm run dev                        # http://localhost:5173
```

Başvuru sistemini uçtan uca çalıştırmak için ücretsiz bir Supabase
projesi gerekir; adım adım kurulum [KURULUM-SUPABASE.md](KURULUM-SUPABASE.md)
dosyasında anlatılır. Anahtar girilmezse site sorunsuz çalışır, yalnızca
başvuru bölümleri gizlenir.

Sitedeki bütün metinler `src/metinler.jsx` dosyasında, Türkçe ve
İngilizce karşılıklarıyla birlikte durur; içerik güncellemeleri kod
bilgisi gerektirmez.

## Katkı

Hata bildirimi ve öneriler için issue, düzeltmeler için pull request
açabilirsiniz. Fikir alışverişi için en hızlı kanal Discord sunucumuzdur.

## Lisans

Kod MIT lisansıyla dağıtılır; ayrıntılar için [LICENSE](LICENSE) dosyasına
bakın. Logo ve topluluk görselleri GeoGuessrTürkiye topluluğuna aittir.
