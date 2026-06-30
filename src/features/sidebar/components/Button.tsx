import { motion } from 'framer-motion';
import type { MouseEventHandler, ReactElement, ReactNode } from 'react';

export type ButtonVariant = 'ghost' | 'primary' | 'secondary';

export interface ButtonProps {
  readonly ariaLabel: string;
  readonly children: ReactNode;
  readonly disabled?: boolean;
  readonly onClick: MouseEventHandler<HTMLButtonElement>;
  readonly variant?: ButtonVariant;
}

/**
 * Accessible animated button with a CSS-driven ripple interaction.
 */
export function Button({
  ariaLabel,
  children,
  disabled = false,
  onClick,
  variant = 'secondary',
}: ButtonProps): ReactElement {
  return (
    <motion.button
      aria-label={ariaLabel}
      className={`im-button im-button--${variant}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
    >
      <span className="im-button__label">{children}</span>
    </motion.button>
  );
}
