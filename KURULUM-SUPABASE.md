# Turnuva Başvuru Sistemi — Supabase Kurulum Rehberi

Sistem şu şekilde çalışır:

- **Etkinlikler sayfası**: Durumu "Açık" olan turnuvalar otomatik listelenir; ziyaretçiler giriş yapmadan başvuru formunu doldurur (Discord kullanıcı adı*, GeoGuessr profil linki*, ad soyad opsiyonel). Açık turnuva yoksa eski "yapım aşamasında" bildirimi görünür.
- **/admin sayfası**: Adminler e-posta/şifre ile giriş yapar; turnuva oluşturur/düzenler/siler, başvuruları görür ve **Onayla / Reddet / Beklet** ile inceler.
- Duyurular siteden değil, Discord'daki turnuva kanalından yapılır; form ve başarı mesajı kullanıcıyı oraya yönlendirir.

## 1. Supabase projesi oluşturun

1. [supabase.com](https://supabase.com) → ücretsiz hesap açın → **New project** (bölge: `eu-central-1 (Frankfurt)` önerilir).
2. Proje açılınca **SQL Editor**'e gidin, bu depodaki [supabase/kurulum.sql](supabase/kurulum.sql) dosyasının içeriğini yapıştırıp **Run** deyin. Bu, tabloları ve güvenlik kurallarını (RLS) oluşturur.

## 2. Admin hesaplarını ekleyin ve kayıt olmayı kapatın

1. **Authentication → Sign In / Providers** bölümünde **"Allow new users to sign up"** seçeneğini **kapatın**. (Böylece dışarıdan kimse hesap açamaz; giriş yapabilen herkes = admin.)
2. **Authentication → Users → Add user → Create new user** ile her admin için e-posta + şifre girin ("Auto Confirm User" işaretli olsun).

## 3. Anahtarları siteye tanıtın

**Project Settings → API** bölümünden iki değeri alın:

- `Project URL` → `VITE_SUPABASE_URL`
- `anon public` anahtarı → `VITE_SUPABASE_ANON_KEY`

Yerel geliştirme için: `.env.local.example` dosyasını `.env.local` adıyla kopyalayıp değerleri girin, sonra `npm run dev`.

Vercel için: **Vercel → Project → Settings → Environment Variables** bölümüne aynı iki değişkeni ekleyin ve yeniden deploy edin.

> `anon` anahtarının sitede görünmesi normaldir ve güvenlidir; yetkiler tamamen veritabanındaki RLS kurallarıyla sınırlıdır (anonim kullanıcı yalnızca açık turnuvaları görebilir ve başvuru ekleyebilir, başvuruları okuyamaz).

## 4. Kullanım akışı

1. `/admin` → giriş yap → **+ Yeni Turnuva** → bilgileri gir, durumunu **Açık** yap.
2. Discord'daki turnuva kanalından duyuruyu yapın (site otomatik duyuru atmaz).
3. Başvurular geldikçe `/admin` → ilgili turnuvada **Başvurular** → Onayla / Reddet.
4. Başvuruları kapatmak için turnuvayı **Düzenle** → durumu **Kapalı** yapın (geçmiş kayıtlar silinmez).

## Güvenlik özeti

- Turnuva tablosu: herkes "taslak" olmayanları okuyabilir; yazma yalnızca giriş yapmış adminlerde.
- Başvuru tablosu: anonim kullanıcı yalnızca **açık ve kontenjanı dolmamış** turnuvaya kayıt ekleyebilir; okuma/güncelleme/silme yalnızca adminlerde.
- Aynı Discord adıyla aynı turnuvaya ikinci başvuru veritabanı seviyesinde engellenir.
- Kontenjan kontrolü sunucu tarafında (`kontenjan_var` fonksiyonu) yapılır.
