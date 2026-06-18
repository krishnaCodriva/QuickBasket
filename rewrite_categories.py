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

# Update the Left Column FlatList
left_flatlist = """            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              renderItem={renderCategoryItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: spacing.xxl }}
              refreshing={mainRefreshing}
              onRefresh={handleMainRefresh}
              onEndReached={handleMainLoadMore}
              onEndReachedThreshold={0.5}
            />"""

content = re.sub(
    r'            <FlatList\n              data=\{categories\}.*?onRefresh=\{onRefresh\}\n            />',
    left_flatlist,
    content,
    flags=re.DOTALL
)

# Update the Right Column FlatList
right_flatlist = """            <FlatList
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
                    {t(STRINGS.productListing.noProducts)}
                  </ThemedText>
                </View>
              }
              refreshing={subCategoriesRefreshing}
              onRefresh={handleSubRefresh}
              onEndReached={handleSubLoadMore}
              onEndReachedThreshold={0.5}
            />"""

content = re.sub(
    r'            <FlatList\n              data=\{subCategories\}.*?onRefresh=\{onRefresh\}\n            />',
    right_flatlist,
    content,
    flags=re.DOTALL
)

with open(file_path, "w") as f:
    f.write(content)
