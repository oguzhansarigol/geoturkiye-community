import Reveal from "./Reveal.jsx";

export default function CtaBand({ eyebrow, title, note, children }) {
  return (
    <section className="cta-band">
      <div className="container cta-in">
        <Reveal><p className="eyebrow">{eyebrow}</p></Reveal>
        <Reveal delay={0.06}><h2>{title}</h2></Reveal>
        <Reveal delay={0.12}><div className="cta-actions">{children}</div></Reveal>
        {note && <Reveal delay={0.18}><p className="cta-note">{note}</p></Reveal>}
      </div>
    </section>
  );
}
