import React from 'react';
import { useTranslation } from 'react-i18next';
import { ThemedText } from './ThemedText';

export const TranslatedText = React.memo(({ 
    textKey, 
    style, 
    numberOfLines, 
    type, 
    useSecondaryText 
}: any) => {
  const { t } = useTranslation();
  return (
    <ThemedText 
        type={type} 
        style={style} 
        numberOfLines={numberOfLines} 
        useSecondaryText={useSecondaryText}
    >
        {t(textKey)}
    </ThemedText>
  );
});
