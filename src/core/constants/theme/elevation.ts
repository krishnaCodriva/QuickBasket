/**
 * @file elevation.ts
 * @description Centralized shadow and elevation tokens for iOS (shadow*) and Android (elevation).
 * All shadow/elevation in the app MUST come from this file.
 *
 * Usage: import { elevation } from '../core/constants/theme';
 *        style={{ ...elevation.md }}
 */

import type { ViewStyle } from 'react-native';

type ElevationStyle = Pick<
  ViewStyle,
  | 'shadowColor'
  | 'shadowOffset'
  | 'shadowOpacity'
  | 'shadowRadius'
  | 'elevation'
>;

export const elevation: Record<string, ElevationStyle> = {
  /** No shadow */
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  /** Subtle — small cards, list items */
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  /** Small — cards */
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  /** Medium — floating cards */
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  /** Large — modals, bottom sheets */
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  /** Extra-large — overlays, sticky bars */
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
} as const;

export type ElevationKey = keyof typeof elevation;
