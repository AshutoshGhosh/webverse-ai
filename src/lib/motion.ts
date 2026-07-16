import { type Variants } from "framer-motion";
import { SPRING } from "./constants";

export const variants = {
  fadeUp: {
    initial: { opacity: 0, y: 20, filter: "blur(4px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, y: -10, filter: "blur(4px)" },
  },
  fadeDown: {
    initial: { opacity: 0, y: -20, filter: "blur(4px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, y: 10, filter: "blur(4px)" },
  },
  fadeLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  fadeRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  cardReveal: {
    initial: { opacity: 0, y: 30, filter: "blur(8px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  },
  pageTransition: {
    initial: { opacity: 0, scale: 0.98, filter: "blur(4px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, scale: 0.98, filter: "blur(4px)" },
  },
  listStagger: {
    animate: { transition: { staggerChildren: 0.06 } },
  },
  hoverLift: {
    rest: { y: 0, boxShadow: "0 0 0 rgba(79,124,255,0)" },
    hover: { y: -4, boxShadow: "0 20px 60px rgba(79,124,255,0.1)" },
  },
  buttonPress: {
    rest: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.97 },
  },
} satisfies Record<string, Variants>;

export const transition = {
  fast: SPRING.fast,
  medium: SPRING.medium,
  gentle: SPRING.gentle,
  elegant: SPRING.elegant,
};
