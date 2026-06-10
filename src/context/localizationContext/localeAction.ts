/**
 * localeAction.ts
 * Refactored under the QuickBasket Enterprise Architecture Plan.
 *
 * Changes:
 * - setLanguage now accepts LanguageCode (typed) instead of string
 * - Return type explicitly typed as LangAction shape
 */

import type { LanguageCode } from '../../core/types/domain';

export const setLanguage = (lange: LanguageCode) => ({
  type: 'SET_LANG' as const,
  payload: lange,
});
