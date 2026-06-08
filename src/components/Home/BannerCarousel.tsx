import { Colors } from '../../constants/colors';
import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, ImageBackground, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemeDimension } from '../../constants/ThemeDimension';
import { useThemeColor } from '../../hooks';

const { width } = Dimensions.get('window');
const BANNER_PADDING = ThemeDimension.spacing.xl;
const BANNER_WIDTH = width - (BANNER_PADDING * 2);

export type BannerType = {
  id: string;
  source: any; // ImageSourcePropType
  linkType?: 'product' | 'category' | 'offer';
  linkTarget?: string;
};

type Props = {
  banners?: BannerType[];
  onBannerPress?: (banner: BannerType) => void;
};

const DEFAULT_BANNERS: BannerType[] = [
  { id: '1', source: require('../../../assets/Section - Hero Carousel (Bento Style).png') },
  { id: '2', source: require('../../../assets/Section - Hero Carousel (Bento Style).png') },
  { id: '3', source: require('../../../assets/Section - Hero Carousel (Bento Style).png') },
];

export default function BannerCarousel({ banners = DEFAULT_BANNERS, onBannerPress }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeColor = useThemeColor({}, 'primary');
  const inactiveColor = useThemeColor({}, 'gray300' as any);
  const bannerBgColor = useThemeColor({ light: Colors.light.gray900, dark: Colors.dark.gray200 }, 'gray900' as any);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const slideSize = BANNER_WIDTH + BANNER_PADDING;
    const index = Math.round(offsetX / slideSize);
    setActiveIndex(Math.max(0, Math.min(index, banners.length - 1)));
  };

  const snapOffsets = banners.map((_, i) => i * (BANNER_WIDTH + BANNER_PADDING));

  return (
    <View style={[styles.container, { marginHorizontal: -BANNER_PADDING }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToOffsets={snapOffsets}
        snapToAlignment="center"
        decelerationRate="fast"
        disableIntervalMomentum={true}
        contentContainerStyle={{ paddingHorizontal: BANNER_PADDING }}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {banners.map((banner, index) => (
          <TouchableOpacity
            key={banner.id}
            activeOpacity={0.9}
            onPress={() => onBannerPress && onBannerPress(banner)}
            style={{ marginRight: index === banners.length - 1 ? 0 : BANNER_PADDING }}
          >
            <ImageBackground
              source={banner.source}
              style={[styles.banner, { backgroundColor: bannerBgColor }]}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.paginationContainer}>
        {banners.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index === activeIndex ? activeColor : inactiveColor,
                width: index === activeIndex ? 20 : 8
              }
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  banner: {
    width: BANNER_WIDTH,
    // Calculate the exact height based on the image's original 362x244 dimensions to prevent cropping
    height: BANNER_WIDTH * (244 / 362),
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.light.gray900, // Dark fallback
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.light.transparentBlack04, // Dark overlay for text readability
  },
  content: {
    padding: 20,
    justifyContent: 'center',
    flex: 1,
  },
  pill: {
    backgroundColor: Colors.light.blue100, // Light blue
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  pillText: {
    color: Colors.light.blue900, // Dark blue text
    fontSize: 10,
    fontWeight: 'bold',
  },
  title: {
    color: Colors.light.white,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    width: '70%',
    lineHeight: 28,
  },
  subtitle: {
    color: Colors.light.gray300, // Light gray
    fontSize: 12,
    width: '65%',
    lineHeight: 18,
  },
});
