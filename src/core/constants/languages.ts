/**
 * @file languages.ts
 * @description Supported languages constant.
 * Single source of truth for all languages available in the app.
 * The language list in HomeScreen and any future language-picker component
 * MUST import from here — never define inline.
 */

import type { SupportedLanguage } from '../types/domain';

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', label: 'English', icon: 'A' },
  { code: 'hi', label: 'हिंदी', icon: 'अ' },
];
