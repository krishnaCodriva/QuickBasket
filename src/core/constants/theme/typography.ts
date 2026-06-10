/**
 * @file typography.ts
 * @description Centralized typography scale for font sizes, weights, and line heights.
 * All typography in the app MUST come from this file.
 *
 * Usage: import { typography } from '../core/constants/theme';
 *        style={{ fontSize: typography.size.md, fontWeight: typography.weight.bold }}
 */

export const typography = {
  size: {
    /** 10px — micro labels, badges */
    xxs: 10,
    /** 11px — tiny supplementary text */
    xs: 11,
    /** 12px — captions, secondary labels */
    sm: 12,
    /** 13px — sub-labels, helper text */
    smmd: 13,
    /** 14px — body text, card content */
    md: 14,
    /** 15px — medium body */
    mdlg: 15,
    /** 16px — default input/button text */
    lg: 16,
    /** 18px — screen titles */
    xl: 18,
    /** 20px — section headers */
    xxl: 20,
    /** 22px — modal titles */
    xxxl: 22,
    /** 24px — large headings */
    display: 24,
    /** 28px — hero headings */
    hero: 28,
    /** 32px — splash/brand text */
    brand: 32,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
    black: '900' as const,
  },
  lineHeight: {
    /** 14px — tight for small text */
    tight: 14,
    /** 16px — compact */
    compact: 16,
    /** 18px — default for labels */
    normal: 18,
    /** 20px — comfortable reading */
    comfortable: 20,
    /** 22px — body paragraphs */
    relaxed: 22,
    /** 24px — loose, spacious */
    loose: 24,
    /** 28px — headings */
    heading: 28,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 1.5,
  },
} as const;

export type TypographySizeKey = keyof typeof typography.size;
export type TypographyWeightKey = keyof typeof typography.weight;
