import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// A basic ThemeDimension setup for responsive values as per best practices
export const ThemeDimension = {
  screenWidth: width,
  screenHeight: height,
  spacing: {
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 40,
  },
  fontSize: {
    s: 12,
    m: 14,
    l: 16,
    xl: 20,
    xxl: 24,
  },
  borderRadius: {
    s: 4,
    m: 8,
    l: 12,
    xl: 16,
  }
};
