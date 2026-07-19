// ============================================================
// Küçük arayüz sesleri (Web Audio; ses dosyası gerekmez).
// Yalnızca tıklamalarda çalar, kısacık ve kısık tutulmuştur.
// Kapatmak için: localStorage.setItem("ggtr-ses", "0")
// ============================================================

let ctx;

function baglam() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function blip(frekans, sure, ses, tip) {
  const c = baglam();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = tip;
  o.frequency.value = frekans;
  const t = c.currentTime;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(ses, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + sure + 0.03);
}

export function sesleriBaslat() {
  if (window.__ggtrSes) return;
  window.__ggtrSes = true;

  document.addEventListener(
    "click",
    (e) => {
      if (localStorage.getItem("ggtr-ses") === "0") return;
      const el = e.target.closest("a, button, summary");
      if (!el) return;
      if (el.classList.contains("btn") || el.closest(".btn")) {
        blip(640, 0.09, 0.05, "triangle"); // butonlar: tok, kısa "tak"
      } else {
        blip(1500, 0.05, 0.03, "sine"); // linkler ve küçük ögeler: ince "tik"
      }
    },
    { capture: true }
  );
}
