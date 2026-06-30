import type { Transition, Variants } from 'framer-motion';

export const SIDEBAR_TRANSITION = {
  damping: 30,
  mass: 0.8,
  stiffness: 320,
  type: 'spring',
} satisfies Transition;

export const SIDEBAR_VARIANTS = {
  closed: {
    opacity: 0,
    x: '104%',
  },
  open: {
    opacity: 1,
    x: 0,
  },
} satisfies Variants;

export const FADE_VARIANTS = {
  hidden: {
    opacity: 0,
    y: 6,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
} satisfies Variants;

export const CARD_VARIANTS = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: (index: number) => ({
    opacity: 1,
    transition: {
      delay: index * 0.035,
      duration: 0.2,
    },
    y: 0,
  }),
} satisfies Variants;
