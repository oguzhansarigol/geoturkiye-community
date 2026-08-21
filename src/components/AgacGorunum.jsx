import { maclariHesapla, TUR_SIRASI } from "../turnuvaAgaci.js";

// ============================================================
// 32 kişilik turnuva ağacı görünümü — hem sitede (salt okunur)
// hem admin panelinde (onKazanan verilirse tıklanabilir) kullanılır.
// Turlar arası bağlantı çizgileri CSS ile çizilir: her tur sütunu
// eşit yükseklikte "slot"lara bölünür; ikili maç grupları (.agac-cift)
// bir sonraki turun maçına dikey çizgiyle bağlanır.
//
// yeniMac verilirse (admin kura çekimi, ilk tur maç indeksi 0-15) o
// maçın iki oyuncusu sırayla (üst → alt) gecikmeli belirir.
//
// avatarlar: { ad: görsel url } verilirse adın yanında avatar görünür.
// onOyuncu: (ad) => void verilirse (turnuva sayfası) oyuncuya tıklanınca
// çağrılır — onKazanan ile birlikte kullanılmaz.
// ============================================================

function Mac({ mac, onKazanan, onOyuncu, avatarlar, yeni }) {
  const oynanabilir = Boolean(mac.ust && mac.alt);
  return (
    <div className="agac-mac">
      {["ust", "alt"].map((taraf) => {
        const oyuncu = mac[taraf];
        const kazandi = mac.kazanan != null && mac.kazanan === oyuncu;
        const kaybetti = mac.kazanan != null && !kazandi;
        const sira = yeni && oyuncu ? (taraf === "ust" ? 0 : 1) : null;
        const avatar = avatarlar && oyuncu ? avatarlar[oyuncu] : null;
        const tiklanir = onKazanan ? oynanabilir && Boolean(oyuncu) : Boolean(onOyuncu && oyuncu);
        return (
          <button
            key={taraf}
            type="button"
            className={`agac-oyuncu${kazandi ? " kazanan" : ""}${kaybetti ? " kaybeden" : ""}${onKazanan ? " secilebilir" : ""}${onOyuncu ? " agac-oyuncu--link" : ""}${sira != null ? " agac-oyuncu--yeni" : ""}`}
            style={sira != null ? { animationDelay: `${sira * 0.35}s` } : undefined}
            disabled={!tiklanir}
            tabIndex={tiklanir ? 0 : -1}
            onClick={
              onKazanan ? () => onKazanan(mac, oyuncu)
              : onOyuncu ? () => onOyuncu(oyuncu)
              : undefined
            }
          >
            {avatarlar && (
              <span className="agac-avatar" aria-hidden="true">
                {avatar ? <img src={avatar} alt="" loading="lazy" /> : (oyuncu ? oyuncu[0] : "")}
              </span>
            )}
            <span className="agac-oyuncu-ad">{oyuncu || " "}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function AgacGorunum({ bolgeler, sonuclar, turAdlari, sampiyonEtiket, onKazanan, onOyuncu, avatarlar, yeniMac }) {
  const turlar = maclariHesapla(bolgeler, sonuclar);
  const sampiyon = turlar.f[0].kazanan;
  const sampiyonAvatar = avatarlar && sampiyon ? avatarlar[sampiyon] : null;

  return (
    <div className="agac-scroll">
      <div className={`agac${avatarlar ? " agac--avatarli" : ""}`}>
        {TUR_SIRASI.map((tur, i) => {
          const maclar = turlar[tur];
          const ciftler = [];
          for (let j = 0; j < maclar.length; j += 2) ciftler.push(maclar.slice(j, j + 2));
          const sinif =
            "agac-tur" +
            (tur === "r1" ? " agac-tur--ilk" : "") +
            (tur === "f" ? " agac-tur--final" : "");
          return (
            <div className={sinif} key={tur}>
              <p className="agac-tur-ad">{turAdlari[i]}</p>
              <div className="agac-kolon">
                {ciftler.map((cift, c) => (
                  <div className={`agac-cift${cift.length === 1 ? " agac-cift--tek" : ""}`} key={c}>
                    {cift.map((mac, k) => (
                      <div className="agac-slot" key={mac.id}>
                        <Mac
                          mac={mac}
                          onKazanan={onKazanan}
                          onOyuncu={onOyuncu}
                          avatarlar={avatarlar}
                          yeni={tur === "r1" && yeniMac != null && c * 2 + k === yeniMac}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        <div className="agac-tur agac-tur--sampiyon">
          <p className="agac-tur-ad">{sampiyonEtiket}</p>
          <div className="agac-kolon">
            <div className="agac-cift agac-cift--tek">
              <div className="agac-slot">
                <div className={`agac-sampiyon${sampiyon ? "" : " bos"}`}>
                  {sampiyonAvatar && <img className="agac-sampiyon-avatar" src={sampiyonAvatar} alt="" />}
                  {sampiyon || " "}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
