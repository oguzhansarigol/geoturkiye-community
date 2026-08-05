// Yürüyen çöp adam figürü — ana sayfadaki koordinat bandında ve
// davet sayfasında kullanılır. Kol/bacak salınımı .yuruyen sınıfının
// CSS animasyonlarıyla verilir (bkz. global.css).
export default function CopAdam() {
  return (
    <svg viewBox="0 0 10 13" width="9.2" height="12">
      <circle cx="5" cy="2" r="1.7" fill="currentColor" />
      <line x1="5" y1="3.7" x2="5" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line className="ca-kol on" x1="5" y1="4.7" x2="5" y2="7.9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <line className="ca-kol arka" x1="5" y1="4.7" x2="5" y2="7.9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <line className="ca-bacak on" x1="5" y1="8" x2="5" y2="12.7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <line className="ca-bacak arka" x1="5" y1="8" x2="5" y2="12.7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}
