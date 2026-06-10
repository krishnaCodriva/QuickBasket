/**
 * LocaleContext.tsx
 * Refactored under the QuickBasket Enterprise Architecture Plan.
 *
 * Changes:
 * - Removed console.log debug statement
 * - Added proper TypeScript types for the context tuple [state, dispatch]
 * - Context value type now correctly reflects [LangState, Dispatch] tuple
 * - Eliminated all `any` types (reducer state/action now typed)
 * - Preserves all existing behavior
 */

import React, { createContext, useEffect, useReducer, Dispatch } from 'react';
import i18n, { getActive } from '../../localization/i18';
import type { LanguageCode } from '../../core/types/domain';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LangState {
  lange: LanguageCode;
}

type LangAction = {
  type: 'SET_LANG';
  payload: LanguageCode;
};

type LocalizationContextValue = [LangState, Dispatch<LangAction>];

// ─── Reducer ──────────────────────────────────────────────────────────────────

const initialValue: LangState = {
  lange: 'en',
};

const reducer = (state: LangState, action: LangAction): LangState => {
  switch (action.type) {
    case 'SET_LANG':
      return { ...state, lange: action.payload };
    default:
      return state;
  }
};

// ─── Context ──────────────────────────────────────────────────────────────────

export const LocalizationContext = createContext<LocalizationContextValue>([
  initialValue,
  () => undefined,
]);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const LocalizationContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [initLang, initialDispatch] = useReducer(reducer, initialValue);

  useEffect(() => {
    getActive(initLang.lange);
  }, [initLang]);

  return (
    <LocalizationContext.Provider value={[initLang, initialDispatch]}>
      {children}
    </LocalizationContext.Provider>
  );
};

export default LocalizationContext;
