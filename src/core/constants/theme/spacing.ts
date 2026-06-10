/**
 * @file spacing.ts
 * @description Centralized spacing scale for padding, margin, and gap.
 * All spacing in the app MUST come from this file.
 *
 * Usage: import { spacing } from '../core/constants/theme';
 *        style={{ padding: spacing.md }}
 */

export const spacing = {
  /** 2px — hair-thin gaps */
  xxs: 2,
  /** 4px — tight internal gaps */
  xs: 4,
  /** 8px — small gaps, icon padding */
  sm: 8,
  /** 12px — compact padding */
  smd: 12,
  /** 16px — standard padding/margin */
  md: 16,
  /** 20px — medium-large */
  mlg: 20,
  /** 24px — large padding/sections */
  lg: 24,
  /** 32px — extra-large, section spacing */
  xl: 32,
  /** 40px — XXL section gaps */
  xxl: 40,
  /** 48px — hero-level */
  xxxl: 48,
  /** 64px — max padding */
  huge: 64,
} as const;

export type SpacingKey = keyof typeof spacing;
