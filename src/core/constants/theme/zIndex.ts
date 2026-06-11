/**
 * @file zIndex.ts
 * @description Centralized z-index scale.
 * All z-index values in the app MUST come from this file.
 *
 * Usage: import { zIndex } from '../core/constants/theme';
 *        style={{ zIndex: zIndex.modal }}
 */

export const zIndex = {
  /** Normal document flow */
  base: 0,
  /** Above standard content — badges, overlays */
  elevated: 10,
  /** Floating action buttons, tooltips */
  floating: 50,
  /** Sticky headers, bottom bars */
  sticky: 100,
  /** Modals, bottom sheets */
  modal: 200,
  /** Toast notifications */
  toast: 300,
  /** Loading overlays */
  overlay: 400,
} as const;

export type ZIndexKey = keyof typeof zIndex;
