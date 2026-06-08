import { Colors } from "../../constants/colors";
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "../ThemedText";
import { ThemeDimension } from "../../constants/ThemeDimension";
import { useThemeColor } from "../../hooks";

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
    source: require("../../../assets/Section - Hero Carousel (Bento Style).png"),
  },
  {
    id: "3",
    source: require("../../../assets/Section - Hero Carousel (Bento Style).png"),
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

  const infiniteBanners = Array(3).fill(banners).flat();
  const slideSize = BANNER_WIDTH + BANNER_PADDING;

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / slideSize);
    setActiveIndex(index % banners.length);
  };

  const getItemLayout = (_: any, index: number) => ({
    length: slideSize,
    offset: slideSize * index,
    index,
  });

  const renderItem = ({ item, index }: { item: BannerType; index: number }) => (
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
        data={infiniteBanners}
        renderItem={renderItem}
        keyExtractor={(_, index) => `banner-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        removeClippedSubviews
        initialScrollIndex={banners.length}
        getItemLayout={getItemLayout}
        contentContainerStyle={{ paddingHorizontal: BANNER_PADDING }}
        onMomentumScrollEnd={handleScroll}
      />
      {/* 
      <View style={styles.paginationContainer}>
        {banners.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor:
                  index === activeIndex ? activeColor : inactiveColor,
                width: index === activeIndex ? 20 : 8,
              },
            ]}
          />
        ))}
      </View>
      */}
    </View>
  );
}

export default React.memo(BannerCarousel);

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
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
    overflow: "hidden",
    position: "relative",
    backgroundColor: Colors.light.gray900, // Dark fallback
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.light.transparentBlack04, // Dark overlay for text readability
  },
  content: {
    padding: 20,
    justifyContent: "center",
    flex: 1,
  },
  pill: {
    backgroundColor: Colors.light.blue100, // Light blue
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  pillText: {
    color: Colors.light.blue900, // Dark blue text
    fontSize: 10,
    fontWeight: "bold",
  },
  title: {
    color: Colors.light.white,
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    width: "70%",
    lineHeight: 28,
  },
  subtitle: {
    color: Colors.light.gray300, // Light gray
    fontSize: 12,
    width: "65%",
    lineHeight: 18,
  },
});
