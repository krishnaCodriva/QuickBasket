import { Colors } from "../../constants/colors";
import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { ThemeDimension } from "../../constants/ThemeDimension";
import { useThemeColor } from "../../hooks";
import { spacing, radius, typography } from "../../core/constants/theme";

const { width } = Dimensions.get("window");
const BANNER_PADDING = ThemeDimension.spacing.m;
const BANNER_WIDTH = width - BANNER_PADDING * 2;

export type BannerType = {
  id: string;
  source: any; // ImageSourcePropType
  linkType?: "product" | "category" | "offer";
  linkTarget?: string;
};

type Props = {
  banners?: BannerType[];
  onBannerPress?: (banner: BannerType) => void;
};

const DEFAULT_BANNERS: BannerType[] = [
  {
    id: "1",
    source: require("../../../assets/Section - Hero Carousel (Bento Style).png"),
  },
  {
    id: "2",
    source: require("../../../assets/banner1.jpg"),
  },
  {
    id: "3",
    source: require("../../../assets/banner2.jpg"),
  },
];

function BannerCarousel({ banners = DEFAULT_BANNERS, onBannerPress }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeColor = useThemeColor({}, "primary");
  const inactiveColor = useThemeColor({}, "gray300" as any);
  const bannerBgColor = useThemeColor(
    { light: Colors.light.gray900, dark: Colors.dark.gray200 },
    "gray900" as any,
  );
  const flatListRef = useRef<FlatList>(null);

  // Seamless jump trick: Add last item to start, and first item to end
  const loopedBanners = useMemo(() => {
    if (!banners || banners.length === 0) return [];
    if (banners.length === 1) return banners;
    return [banners[banners.length - 1], ...banners, banners[0]];
  }, [banners]);

  const slideSize = BANNER_WIDTH + BANNER_PADDING;

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / slideSize);
    
    // Jump logic for seamless loop
    if (index === 0) {
      // Reached the fake first item -> Jump to the real last item
      flatListRef.current?.scrollToOffset({
        offset: banners.length * slideSize,
        animated: false,
      });
      setActiveIndex(banners.length - 1);
    } else if (index === loopedBanners.length - 1) {
      // Reached the fake last item -> Jump to the real first item
      flatListRef.current?.scrollToOffset({
        offset: slideSize,
        animated: false,
      });
      setActiveIndex(0);
    } else {
      setActiveIndex(index - 1);
    }
  };

  const getItemLayout = (_: any, index: number) => ({
    length: slideSize,
    offset: slideSize * index,
    index,
  });

  // Auto-play effect
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      // Scroll to the next item
      const nextIndex = activeIndex + 2; 
      flatListRef.current?.scrollToOffset({
        offset: nextIndex * slideSize,
        animated: true,
      });
    }, 3000);
    return () => clearInterval(timer);
  }, [activeIndex, banners.length, slideSize]);

  const renderItem = ({ item }: { item: BannerType }) => (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => onBannerPress && onBannerPress(item)}
      style={{ marginRight: BANNER_PADDING }}
    >
      <Image
        source={item.source}
        style={[styles.banner, { backgroundColor: bannerBgColor }]}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { marginHorizontal: -BANNER_PADDING }]}>
      <FlatList
        ref={flatListRef}
        data={loopedBanners}
        renderItem={renderItem}
        keyExtractor={(_, index) => `banner-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        removeClippedSubviews={false}
        getItemLayout={getItemLayout}
        contentContainerStyle={{ paddingHorizontal: BANNER_PADDING }}
        onMomentumScrollEnd={handleScroll}
        contentOffset={{ x: banners.length > 1 ? slideSize : 0, y: 0 }}
      />
    </View>
  );
}

export default React.memo(BannerCarousel);

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.md,
  },
  dot: {
    height: spacing.sm,
    borderRadius: radius.xs,
    marginHorizontal: spacing.xs,
  },
  banner: {
    width: BANNER_WIDTH,
    // Calculate the exact height based on the image's original 362x244 dimensions to prevent cropping
    height: BANNER_WIDTH * (244 / 362),
    borderRadius: radius.lg,
    overflow: "hidden",
    position: "relative",
    backgroundColor: Colors.light.gray900, // Dark fallback
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.light.transparentBlack04, // Dark overlay for text readability
  },
  content: {
    padding: spacing.mlg,
    justifyContent: "center",
    flex: 1,
  },
  pill: {
    backgroundColor: Colors.light.blue100, // Light blue
    paddingHorizontal: spacing.smd,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    alignSelf: "flex-start",
    marginBottom: spacing.smd,
  },
  pillText: {
    color: Colors.light.blue900, // Dark blue text
    fontSize: typography.size.xxs,
    fontWeight: typography.weight.bold,
  },
  title: {
    color: Colors.light.white,
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.sm,
    width: "70%",
    lineHeight: 28,
  },
  subtitle: {
    color: Colors.light.gray300, // Light gray
    fontSize: typography.size.sm,
    width: "65%",
    lineHeight: 18,
  },
});
