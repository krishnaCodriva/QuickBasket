import re

file_path = "/home/satyam/Downloads/QuickBasket/src/screens/Categories/CategoriesScreen.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Replace useCategories with usePaginatedCategories
content = content.replace(
    'import { useThemeColor, useCategories, useRefresh } from "../../hooks";',
    'import { useThemeColor, usePaginatedCategories } from "../../hooks";'
)

# Update state variables
new_state = """  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const {
    data: categories,
    isLoading: categoriesLoading,
    isRefreshing: mainRefreshing,
    handleRefresh: handleMainRefresh,
    handleLoadMore: handleMainLoadMore,
  } = usePaginatedCategories(null);

  const {
    data: subCategoriesData,
    isLoading: subCategoriesLoading,
    isRefreshing: subCategoriesRefreshing,
    handleRefresh: handleSubRefresh,
    handleLoadMore: handleSubLoadMore,
  } = usePaginatedCategories(selectedCategoryId);

  // Auto-select first category when loaded or categoryId from params
  useEffect(() => {
    if (categories.length > 0) {
      if (route.params?.categoryId) {
        setSelectedCategoryId(route.params.categoryId);
        // Clear param so subsequent changes aren't overridden
        navigation.setParams({ categoryId: undefined });
      } else if (!selectedCategoryId) {
        setSelectedCategoryId(categories[0].id);
      }
    }
  }, [categories, selectedCategoryId, route.params?.categoryId, navigation]);

  const subCategories = subCategoriesData || [];
"""

content = re.sub(
    r'  const \{ categories, isLoading: categoriesLoading, refresh \} = useCategories\(\);\n.*?const subCategoriesLoading = false;\n',
    new_state,
    content,
    flags=re.DOTALL
)

# Add inactive styling
colors_hook = """  const imageBgColor = useThemeColor(
    { light: "rgba(0,0,0,0.05)", dark: "rgba(255,255,255,0.05)" },
    "transparentWhite04" as any,
  );
  const inactiveStickerBg = useThemeColor({}, "primaryText" as any);
  const inactiveStickerText = useThemeColor({}, "primaryBackground" as any);
"""

content = re.sub(
    r'  const imageBgColor = useThemeColor\(\n    \{ light: "rgba\(0,0,0,0\.05\)", dark: "rgba\(255,255,255,0\.05\)" \},\n    "transparentWhite04" as any,\n  \);\n',
    colors_hook,
    content,
    flags=re.DOTALL
)

# Update render items
render_items = """  const renderCategoryItem = ({ item }: { item: any }) => {
    const isSelected = item.id === selectedCategoryId;
    const isInactive = item.status === "Inactive" || item.isActive === false;
    
    return (
      <View style={{ opacity: isInactive ? 0.5 : 1 }}>
        <CategoryCard
          name={t(item.nameKey || item.name)}
          emoji={item.emoji || "📦"}
          imageUrl={item.imageUrl ? formatImageUrl(item.imageUrl) : undefined}
          colorName={item.colorName || "blue100"}
          isSelected={isSelected}
          onPress={() => {
            if (!isInactive) setSelectedCategoryId(item.id);
          }}
          containerStyle={{
            width: "100%",
            marginRight: 0,
            paddingVertical: spacing.md,
            backgroundColor: isSelected ? selectedCatBg : leftColBg,
          }}
        />
        {isInactive && (
          <View style={[StyleSheet.absoluteFill, styles.inactiveOverlayLeft]}>
            <ThemedText style={[styles.inactiveTextLeft, { backgroundColor: inactiveStickerBg, color: inactiveStickerText }]}>
              {t(STRINGS.common?.inactive || "Inactive")}
            </ThemedText>
          </View>
        )}
      </View>
    );
  };

  const renderSubCategoryItem = ({ item }: { item: any }) => {
    const isInactive = item.status === "Inactive" || item.isActive === false;
    return (
      <TouchableOpacity
        style={[styles.subCategoryCard, { backgroundColor: searchBg, opacity: isInactive ? 0.6 : 1 }]}
        onPress={() => {
          if (!isInactive) handleSubCategoryPress(item);
        }}
        activeOpacity={isInactive ? 1 : 0.7}
      >
        <Image
          source={{ uri: item.imageUrl ? formatImageUrl(item.imageUrl) : "https://via.placeholder.com/150" }}
          style={[styles.subCategoryImage, { backgroundColor: imageBgColor }]}
        />
        <ThemedText style={styles.subCategoryName} numberOfLines={2}>
          {t(item.nameKey || item.name)}
        </ThemedText>
        {isInactive && (
          <View style={styles.inactiveOverlayRight}>
            <ThemedText style={[styles.inactiveTextRight, { backgroundColor: inactiveStickerBg, color: inactiveStickerText }]}>
              {t(STRINGS.common?.inactive || "Inactive")}
            </ThemedText>
          </View>
        )}
      </TouchableOpacity>
    );
  };"""

content = re.sub(
    r'  const renderCategoryItem = .*?\};\n\n  const renderSubCategoryItem = .*?\n  \);\n',
    render_items,
    content,
    flags=re.DOTALL
)

# Update the Left Column FlatList
left_flatlist = """        <View style={[styles.leftColumn, { backgroundColor: leftColBg }]}>
          {categoriesLoading && categories.length === 0 ? (
            <ActivityIndicator
              size="small"
              color={primaryColor}
              style={{ marginTop: spacing.xl }}
            />
          ) : (
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              renderItem={renderCategoryItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: spacing.xxl }}
              refreshing={mainRefreshing}
              onRefresh={handleMainRefresh}
              onEndReached={handleMainLoadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                categoriesLoading && categories.length > 0 ? (
                  <ActivityIndicator size="small" color={primaryColor} style={{ marginVertical: spacing.md }} />
                ) : null
              }
            />
          )}
        </View>"""

content = re.sub(
    r'        <View style=\{\[styles\.leftColumn, \{ backgroundColor: leftColBg \}\]\}>\n.*?        </View>',
    left_flatlist,
    content,
    flags=re.DOTALL
)

# Update the Right Column FlatList
right_flatlist = """        <View style={styles.rightColumn}>
          {subCategoriesLoading && subCategories.length === 0 ? (
            <ActivityIndicator
              size="large"
              color={primaryColor}
              style={{ marginTop: spacing.xxxl }}
            />
          ) : (
            <FlatList
              data={subCategories}
              keyExtractor={(item) => item.id}
              renderItem={renderSubCategoryItem}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[styles.subCatListContent, subCategories.length === 0 && { flex: 1 }]}
              columnWrapperStyle={subCategories.length > 0 ? styles.subCatColumnWrapper : undefined}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <ThemedText useSecondaryText>
                    No subcategories found
                  </ThemedText>
                </View>
              }
              refreshing={subCategoriesRefreshing}
              onRefresh={handleSubRefresh}
              onEndReached={handleSubLoadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                subCategoriesLoading && subCategories.length > 0 ? (
                  <ActivityIndicator size="small" color={primaryColor} style={{ marginVertical: spacing.md }} />
                ) : null
              }
            />
          )}
        </View>"""

content = re.sub(
    r'        <View style=\{styles\.rightColumn\}>\n.*?        </View>',
    right_flatlist,
    content,
    flags=re.DOTALL
)

# Add Styles
styles_content = """  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  inactiveOverlayLeft: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  inactiveTextLeft: {
    fontSize: 12,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: "hidden",
  },
  inactiveOverlayRight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  inactiveTextRight: {
    fontSize: 12,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: "hidden",
  },
});"""

content = re.sub(
    r'  emptyContainer: \{\n    flex: 1,\n    justifyContent: "center",\n    alignItems: "center",\n  \},\n\}\);',
    styles_content,
    content,
    flags=re.DOTALL
)

with open(file_path, "w") as f:
    f.write(content)
