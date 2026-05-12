import type { Transition, Variants } from "framer-motion";

export const snappySpring: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 28,
};

export const fadeUpContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
};

export const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: snappySpring,
  },
};
