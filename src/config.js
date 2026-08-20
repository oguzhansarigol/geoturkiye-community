// ============================================================
// GeoGuessrTürkiye — site ayarları
// Yayına almadan önce bu dosyayı güncelleyin; linkler tüm
// sayfalara buradan dağılır.
// ============================================================

// Discord davet linki
export const DISCORD_URL = "https://discord.gg/JqxyV9PxdV";

// Günlük challenge kanalı (Discord — #günlük-challenge)
export const GUNLUK_CHALLENGE_URL =
  "https://discord.com/channels/1042174912292470845/1147290291901055067";

// Turnuva yayınlarının yapıldığı YouTube kanalı
export const TURNUVA_YAYIN_URL = "https://www.youtube.com/@oguzhansarigol";

// Ana sayfadaki "Turnuva Ağacı" tuşu normalde yayındaki ağacı
// Supabase'den kendisi bulur; burası yalnızca ağaç henüz
// yüklenmemişken / bulunamazsa kullanılan yedek adrestir.
export const TURNUVA_SAYFA_YOLU = "/turnuva/5e0023a7-2596-4524-87ed-4b8495278ab4";

// Davetli turnuva davet sayfası — sadece bu linki bilenler görür.
// Slug'ı değiştirirseniz eski link geçersiz olur.
export const DAVET_YOLU = "/davet/nm-2026";
export const DAVET_EPOSTA = "oguzhansarigol1@gmail.com";
export const DAVET_DISCORD = "ogzhnsrgl";

// Sponsorluk başvurularının yönlendirileceği e-posta
export const SPONSOR_EPOSTA = "oguzhansarigol1@gmail.com";

// Sosyal medya hesapları (yeni hesap açılınca buraya ekleyin,
// footer'da otomatik görünür — örn. { ad: "YouTube", url: "https://..." })
export const SOCIALS = [
  { ad: "Discord", url: DISCORD_URL },
];
