// URL'ye ?noanim eklenirse tüm giriş animasyonları atlanır ve sayfa
// doğrudan son hâliyle çizilir (test / hata ayıklama için).
export const NOANIM =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).has("noanim");
