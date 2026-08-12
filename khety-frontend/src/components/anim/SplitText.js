import { motion } from "framer-motion";

/**
 * Headline that reveals word-by-word with a slide-up + mask effect,
 * ideal for cinematic hero typography.
 */
function SplitText({ text, className = "", delay = 0, as: Tag = "h1", stagger = 0.06 }) {
  const words = String(text).split(" ");

  const container = {
    hidden: {},
    visible: (custom) => ({
      transition: { staggerChildren: stagger, delayChildren: custom }
    })
  };

  const word = {
    hidden: { y: "115%", opacity: 0 },
    visible: {
      y: "0%",
      opacity: 1,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <Tag className={className} aria-label={text}>
      <motion.span
        variants={container}
        initial="hidden"
        animate="visible"
        custom={delay}
        className="inline-block"
      >
        {words.map((w, i) => (
          <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
            <motion.span
              variants={word}
              className="inline-block will-change-transform"
              aria-hidden="true"
            >
              {w}
              {i < words.length - 1 ? "\u00A0" : ""}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}

export default SplitText;
