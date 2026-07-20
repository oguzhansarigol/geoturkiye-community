import { motion } from "motion/react";
import { Link } from "react-router-dom";

const MotionLink = motion.create(Link);

// kind: red | ink | ghost | light | ghost-light
// İç sayfa için `to`, dış bağlantı için `href` kullanın;
// ikisi de verilmezse gerçek bir <button> üretir (formlar için).
export default function Btn({ to, href, kind = "red", arrow, children, ...rest }) {
  const cls = `btn btn--${kind}`;
  const micro = { whileTap: { scale: 0.97 }, whileHover: { y: -2 } };
  const inner = (
    <>
      {children}
      {arrow && <span className="arr">{arrow}</span>}
    </>
  );

  if (!to && !href) {
    return (
      <motion.button className={cls} {...micro} {...rest}>
        {inner}
      </motion.button>
    );
  }

  if (to) {
    return (
      <MotionLink to={to} className={cls} {...micro} {...rest}>
        {inner}
      </MotionLink>
    );
  }
  return (
    <motion.a
      href={href}
      className={cls}
      target={href && href.startsWith("http") ? "_blank" : undefined}
      rel={href && href.startsWith("http") ? "noopener" : undefined}
      {...micro}
      {...rest}
    >
      {inner}
    </motion.a>
  );
}
