import { motion } from 'framer-motion';
import type { ReactElement, ReactNode } from 'react';

import { CARD_VARIANTS } from '../SidebarAnimations';

export interface CardProps {
  readonly children: ReactNode;
  readonly index: number;
}

/**
 * Reusable animated glass surface for sidebar content.
 */
export function Card({ children, index }: CardProps): ReactElement {
  return (
    <motion.article
      animate="visible"
      className="im-card"
      custom={index}
      initial="hidden"
      variants={CARD_VARIANTS}
      whileHover={{ y: -2 }}
    >
      {children}
    </motion.article>
  );
}
