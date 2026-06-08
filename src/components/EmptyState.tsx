import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { CustomButton } from './CustomButton';

interface EmptyStateProps {
  emoji: string;
  title: string;
  buttonText?: string;
  onButtonPress?: () => void;
  containerStyle?: any;
}

export default function EmptyState({ 
  emoji, 
  title, 
  buttonText, 
  onButtonPress,
  containerStyle
}: EmptyStateProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <ThemedText style={styles.emoji}>{emoji}</ThemedText>
      <ThemedText type="subtitle" style={styles.title}>{title}</ThemedText>
      
      {buttonText && onButtonPress && (
        <CustomButton 
          title={buttonText} 
          type="primary" 
          onPress={onButtonPress}
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  button: {
    marginTop: 24,
    width: 200,
  }
});
