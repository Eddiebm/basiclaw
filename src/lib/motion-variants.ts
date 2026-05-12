import type { Transition, Variants } from "framer-motion";

/** Default spring for snappy section entrances */
export const snappySpring: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

export const fadeUpContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};
