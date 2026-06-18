import re

file_path = "/home/satyam/Downloads/QuickBasket/src/screens/Categories/CategoriesScreen.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Add imports
content = content.replace(
    'import { ThemedView, ThemedText, CartHeaderIcon } from "../../components";',
    'import { ThemedView, ThemedText, CartHeaderIcon, ProductCard } from "../../components";\nimport { useCart } from "../../context";\nimport { useProductListing } from "../ProductListing/useProductListing";'
)

# Add state and hooks
new_state = """  const { refreshing, onRefresh } = useRefresh(refresh);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | null>(null);

  const { cartItems } = useCart();
  const {
    products,
    isLoading: productsLoading,
    isInitialLoad,
    isRefreshing: productsRefreshing,
    hasMore,
    setFilterCategoryId,
    setFilterSubCategoryId,
    handleRefresh: handleProductRefresh,
    handleLoadMore,
    handleUpdateCart,
  } = useProductListing({ categoryId: selectedCategoryId || undefined });

  useEffect(() => {
    setSelectedSubCategoryId(null);
    setFilterCategoryId(selectedCategoryId);
    setFilterSubCategoryId(null);
  }, [selectedCategoryId, setFilterCategoryId, setFilterSubCategoryId]);

  useEffect(() => {
    setFilterSubCategoryId(selectedSubCategoryId);
  }, [selectedSubCategoryId, setFilterSubCategoryId]);
"""

content = re.sub(
    r'  const { refreshing, onRefresh } = useRefresh\(refresh\);\n  const \[selectedCategoryId, setSelectedCategoryId\] = useState<string \| null>\(\n    null,\n  \);',
    new_state,
    content
)

# Add pills render
new_pill_render = """  const renderSubCategoryPill = ({ item }: { item: SubCategory }) => {
    const isSelected = item.id === selectedSubCategoryId;
    return (
      <TouchableOpacity
        style={[
          styles.subCatPill,
          { backgroundColor: isSelected ? primaryColor : searchBg }
        ]}
        onPress={() => setSelectedSubCategoryId(isSelected ? null : item.id)}
      >
        <ThemedText style={[
          styles.subCatPillText,
          { color: isSelected ? Colors.light.white : Colors.light.gray600 }
        ]}>
          {t(item.nameKey || item.name)}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  const renderProductItem = ({ item }: { item: any }) => {
    const imageUrl = item.imageUrl ? formatImageUrl(item.imageUrl) : "https://via.placeholder.com/150";
    return (
      <ProductCard
        id={item.id}
        name={item.name}
        price={`₹${Number(item.price || 0).toFixed(2)}`}
        mrp={`₹${Number(item.compareAtPrice || item.price || 0).toFixed(2)}`}
        category={item.Category?.name || "Grocery"}
        weight={item.weight || "1 unit"}
        emoji={item.emoji || "📦"}
        inStock={item.inStock !== false && (item.stockQuantity === undefined || Number(item.stockQuantity) > 0)}
        imageUrl={imageUrl}
        brand={item.brand}
        tags={item.tags}
        quantity={cartItems.find(i => i.id === item.id)?.quantity || 0}
        onAdd={() => handleUpdateCart(item, 1)}
        onRemove={() => handleUpdateCart(item, -1)}
        onPress={() => navigation.navigate("ProductDetail", { product: item })}
        isGrid={true}
        containerStyle={{ width: "47%", marginBottom: spacing.md }}
      />
    );
  };
"""

content = re.sub(
    r'  const handleSubCategoryPress.*?const renderSubCategoryItem =.*?</TouchableOpacity>\n  \);\n' ,
    new_pill_render,
    content,
    flags=re.DOTALL
)

# Right column replacement
new_right_col = """        {/* Right Column: Products & Sub Categories */}
        <View style={styles.rightColumn}>
          {subCategories.length > 0 && (
            <View style={{ paddingTop: spacing.md, paddingHorizontal: spacing.md }}>
              <FlatList
                horizontal
                data={subCategories}
                keyExtractor={(item) => item.id}
                renderItem={renderSubCategoryPill}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          )}

          <FlatList
            data={products}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={renderProductItem}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.productListContent, products.length === 0 && { flex: 1 }]}
            columnWrapperStyle={styles.subCatColumnWrapper}
            onRefresh={handleProductRefresh}
            refreshing={productsRefreshing}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              (productsLoading || isInitialLoad) ? (
                <View style={styles.loadingContainer}>
                   <ActivityIndicator size="large" color={primaryColor} />
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <ThemedText useSecondaryText>
                    {t(STRINGS.productListing.noProducts)}
                  </ThemedText>
                </View>
              )
            }
          />
        </View>"""

content = re.sub(
    r'        {\/\* Right Column: Sub Categories \*\/}.*?</View>\n' ,
    new_right_col + '\n',
    content,
    flags=re.DOTALL
)

# Styles replacement
new_styles = """  subCatListContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  productListContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  subCatColumnWrapper: {
    justifyContent: "space-between",
  },
  subCatPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  subCatPillText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
"""

content = re.sub(
    r'  subCatListContent: \{.*?emptyContainer: \{.*?\},\n',
    new_styles,
    content,
    flags=re.DOTALL
)

with open(file_path, "w") as f:
    f.write(content)
