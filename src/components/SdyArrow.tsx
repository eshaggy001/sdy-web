import React from 'react';

interface SdyArrowProps {
  /** Tailwind / custom className — control size, color (via `text-*`), opacity, position */
  className?: string;
}

/**
 * Official SDY single-chevron brand element.
 * Source: /documents/sdy-arrow.svg  (viewBox 0 0 96.54 106.32)
 *
 * Use `text-sdy-red` or `text-white` to control fill color.
 * Use `opacity-[0.05]` etc. for background/decorative use.
 * Always rendered aria-hidden — never the sole conveyor of meaning.
 */
export const SdyArrow = ({ className = '' }: SdyArrowProps) => (
  <svg
    viewBox="0 0 96.54 106.32"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
    className={className}
  >
    <polygon points="76.9 33.57 90.86 47.52 93.52 50.16 96.54 53.05 76.94 72.67 74.79 74.88 72.39 77.28 70.01 79.68 67.53 82.06 43.26 106.32 0 106.31 53.13 53.16 9.57 9.58 0 0 43.28 0 52.68 9.37 54.03 10.68 55.84 12.47 58.12 14.75 60.52 17.15 62.8 19.43 65.2 21.84 67.6 24.23 69.99 26.63 72.39 29.03 74.79 31.43 76.9 33.57" />
  </svg>
);
