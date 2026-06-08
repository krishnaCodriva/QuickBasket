import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "./ThemedText";
import { TranslatedText } from "./TranslatedText";
import { Colors, STRINGS } from "../constants";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "../hooks";

type Props = {
  id: string;
  name: string;
  price: string;
  mrp?: string;
  category: string;
  weight: string;
  emoji: string;
  quantity: number;
  inStock?: boolean;
  isGrid?: boolean;
  containerStyle?: any;
  onAdd: () => void;
  onRemove: () => void;
  onPress?: () => void;
};

const ProductCard = ({
  id,
  name,
  price,
  mrp,
  category,
  weight,
  emoji,
  quantity,
  inStock = true,
  isGrid = false,
  containerStyle,
  onAdd,
  onRemove,
  onPress,
}: Props) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const bg = useThemeColor(
    { light: Colors.light.gray100, dark: Colors.dark.primaryBackground },
    "primaryBackground" as any,
  );
  const hearColor = useThemeColor({}, "heart");
  const activeHeartColor = useThemeColor(
    { light: Colors.light.red600, dark: Colors.dark.error },
    "error" as any,
  );
  const cardBg = useThemeColor(
    { light: Colors.light.white, dark: Colors.dark.secondaryBackground },
    "primaryBackground" as any,
  );
  const borderColor = useThemeColor(
    { light: Colors.light.gray200, dark: Colors.dark.gray300 },
    "gray200" as any,
  );
  const imageBg = useThemeColor(
    { light: Colors.light.gray100, dark: Colors.dark.gray300 },
    "gray100" as any,
  );
  const categoryColor = useThemeColor(
    { light: Colors.dark.gray400, dark: Colors.light.gray400 },
    "secondaryText" as any,
  );
  const nameColor = useThemeColor(
    { light: Colors.light.gray900, dark: Colors.light.gray100 },
    "primaryText" as any,
  );
  const priceColor = useThemeColor(
    { light: Colors.light.black, dark: Colors.light.white },
    "primaryText" as any,
  );
  const mrpColor = useThemeColor(
    { light: Colors.light.gray400, dark: Colors.dark.gray400 },
    "secondaryText" as any,
  );
  const actionBtnBg = useThemeColor(
    { light: Colors.light.black, dark: Colors.light.white },
    "primaryText" as any,
  );
  const actionBtnIcon = useThemeColor(
    { light: Colors.light.white, dark: Colors.light.black },
    "primaryBackground" as any,
  );
  const disabledBtnBg = useThemeColor(
    { light: Colors.light.gray300, dark: Colors.dark.gray700 },
    "gray300" as any,
  );
  const outOfStockBg = useThemeColor(
    {
      light: Colors.light.transparentWhite06,
      dark: Colors.dark.transparentBlack05,
    },
    "primaryBackground" as any,
  );
  const outOfStockBadgeBg = useThemeColor(
    { light: Colors.light.red600, dark: Colors.dark.error },
    "error" as any,
  );
  const outOfStockBadgeText = useThemeColor(
    { light: Colors.light.white, dark: Colors.light.white },
    "white" as any,
  );

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.card,
        isGrid && styles.gridCard,
        containerStyle,
        { backgroundColor: cardBg, borderColor: borderColor },
      ]}
    >
      <View
        style={[
          styles.imageContainer,
          isGrid && styles.gridImageContainer,
          { backgroundColor: isGrid ? imageBg : bg },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.heartButton,
            { backgroundColor: cardBg },
            isGrid && styles.gridHeartButton,
          ]}
          onPress={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={isGrid ? 16 : 20}
            color={isFavorite ? activeHeartColor : hearColor}
          />
        </TouchableOpacity>
        <ThemedText style={[styles.emoji, isGrid && styles.gridEmoji]}>
          {emoji}
        </ThemedText>

        <View style={styles.pillsContainer}>
          <View style={[styles.pill, { backgroundColor: cardBg }]}>
            <TranslatedText
              numberOfLines={1}
              style={[styles.pillText, { color: categoryColor }]}
              textKey={category}
            />
          </View>
          <View style={[styles.pill, { backgroundColor: cardBg }]}>
            <ThemedText
              numberOfLines={1}
              style={[styles.pillText, { color: categoryColor }]}
            >
              {weight}
            </ThemedText>
          </View>
        </View>

        {!inStock && (
          <View
            style={[
              styles.outOfStockOverlay,
              { backgroundColor: outOfStockBg },
            ]}
          >
            <TranslatedText
              style={[
                styles.outOfStockText,
                {
                  backgroundColor: outOfStockBadgeBg,
                  color: outOfStockBadgeText,
                },
              ]}
              textKey={STRINGS.productListing.outOfStock}
            />
          </View>
        )}
      </View>

      <View style={[styles.infoContainer, isGrid && styles.gridInfoContainer]}>
        <TranslatedText
          style={[styles.name, isGrid && styles.gridName, { color: nameColor }]}
          numberOfLines={2}
          textKey={name}
        />

        <View style={styles.bottomRow}>
          <View style={styles.priceColumn}>
            <View style={[styles.priceRow, isGrid && styles.gridPriceRow]}>
              <ThemedText
                style={[
                  styles.price,
                  isGrid && styles.gridPrice,
                  { color: priceColor },
                ]}
              >
                {price}
              </ThemedText>
            </View>
            {mrp && (
              <View style={styles.mrpRow}>
                <ThemedText style={[styles.mrp, { color: mrpColor }]}>
                  {mrp}
                </ThemedText>
              </View>
            )}
          </View>

          <View style={styles.actionColumn}>
            {quantity > 0 ? (
              <View
                style={[
                  styles.quantityControl,
                  { backgroundColor: actionBtnBg },
                  isGrid && styles.gridQuantityControl,
                ]}
              >
                <TouchableOpacity
                  onPress={() => inStock && onRemove()}
                  style={styles.qtyBtn}
                >
                  <Ionicons
                    name="remove"
                    size={isGrid ? 14 : 16}
                    color={actionBtnIcon}
                  />
                </TouchableOpacity>
                <ThemedText
                  style={[
                    styles.qtyText,
                    { color: actionBtnIcon },
                    isGrid && styles.gridQtyText,
                  ]}
                >
                  {quantity}
                </ThemedText>
                <TouchableOpacity
                  onPress={() => inStock && onAdd()}
                  style={styles.qtyBtn}
                >
                  <Ionicons
                    name="add"
                    size={isGrid ? 14 : 16}
                    color={actionBtnIcon}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.addButton,
                  { backgroundColor: actionBtnBg, shadowColor: actionBtnBg },
                  isGrid && styles.gridAddButton,
                  !inStock && {
                    backgroundColor: disabledBtnBg,
                    shadowOpacity: 0,
                  },
                ]}
                onPress={() => inStock && onAdd()}
                disabled={!inStock}
              >
                <Ionicons
                  name="add"
                  size={isGrid ? 18 : 20}
                  color={actionBtnIcon}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "95%", // Takes 95% of the available width
    borderRadius: 24,
    borderWidth: 1,
    marginRight: 16,
    padding: 12,
  },
  imageContainer: {
    height: 170,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
  },
  heartButton: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  gridHeartButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  pillsContainer: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: "row",
    gap: 6,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexShrink: 1,
  },
  pillText: {
    fontSize: 9,
    fontWeight: "bold",
  },
  emoji: {
    fontSize: 74,
  },
  gridEmoji: {
    fontSize: 64,
  },
  infoContainer: {
    paddingTop: 12,
    flex: 1,
  },
  gridInfoContainer: {
    paddingTop: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 8,
    minHeight: 40,
    lineHeight: 18,
  },
  gridName: {
    fontSize: 13,
    minHeight: 36,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
  },
  priceColumn: {
    flex: 1,
    justifyContent: "center",
  },
  actionColumn: {
    marginLeft: 8,
    justifyContent: "center",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  gridPriceRow: {
    marginBottom: 0,
  },
  price: {
    fontSize: 16,
    fontWeight: "900", // Extra bold price
  },
  gridPrice: {
    fontSize: 14,
  },
  mrpRow: {
    marginTop: 2,
  },
  mrp: {
    fontSize: 11,
    textDecorationLine: "line-through",
  },
  addButton: {
    width: 34, // Large circular button
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  gridAddButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 17, // Match Add button height
    height: 34,
    paddingHorizontal: 6,
    minWidth: 70,
  },
  gridQuantityControl: {
    height: 30,
    borderRadius: 15,
    paddingHorizontal: 4,
    minWidth: 64,
  },
  qtyBtn: {
    padding: 4,
  },
  qtyText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  gridQtyText: {
    fontSize: 12,
  },
  gridCard: {
    width: "100%",
    marginRight: 0,
    marginBottom: 20,
  },
  gridImageContainer: {
    height: 150,
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  outOfStockText: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default React.memo(ProductCard, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.quantity === nextProps.quantity &&
    prevProps.inStock === nextProps.inStock &&
    prevProps.isGrid === nextProps.isGrid
  );
});
