/**
 * @file radius.ts
 * @description Centralized border-radius scale.
 * All border radius values in the app MUST come from this file.
 *
 * Usage: import { radius } from '../core/constants/theme';
 *        style={{ borderRadius: radius.md }}
 */

export const radius = {
  /** 0 — no rounding */
  none: 0,
  /** 4px — slight rounding, small chips */
  xs: 4,
  /** 8px — cards, inputs */
  sm: 8,
  /** 12px — medium cards */
  md: 12,
  /** 16px — large cards, modals */
  lg: 16,
  /** 20px — prominent cards */
  xl: 20,
  /** 24px — bottom sheets, floating elements */
  xxl: 24,
  /** 9999px — pills, fully rounded buttons */
  pill: 9999,
  /** 50% equivalent — use for square elements to make circles */
  circle: 999,
} as const;

export type RadiusKey = keyof typeof radius;
