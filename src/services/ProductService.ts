import { MOCK_PRODUCTS } from '../data/mockData';
import { STRINGS } from '../constants';

export interface ProductQuery {
  page: number;
  limit?: number;
  categoryId?: string;
  subCategoryId?: string;
  searchQuery?: string;
  inStockOnly?: boolean;
  outOfStockOnly?: boolean;
  sortOption?: string;
}

export class ProductService {
  /**
   * Fetch a paginated list of products based on query parameters.
   */
  static getProducts(query: ProductQuery) {
    const { page, limit = 10, categoryId, subCategoryId, searchQuery, inStockOnly, outOfStockOnly, sortOption } = query;

    let filteredData = MOCK_PRODUCTS;

    if (categoryId) {
      filteredData = filteredData.filter(item => item.categoryId === categoryId);
    }
    
    if (subCategoryId) {
      filteredData = filteredData.filter(item => item.subCategoryId === subCategoryId);
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filteredData = filteredData.filter(item => 
        item.name.toLowerCase().includes(lowerQuery) ||
        item.category.toLowerCase().includes(lowerQuery) ||
        item.category?.toLowerCase().includes(lowerQuery)
      );
    }

    if (inStockOnly) {
      filteredData = filteredData.filter(item => item.inStock);
    }
    
    if (outOfStockOnly) {
      filteredData = filteredData.filter(item => !item.inStock);
    }

    if (sortOption) {
      if (sortOption === 'productListing.sortOptions.priceLowHigh') {
        filteredData = [...filteredData].sort((a, b) => a.price - b.price);
      } else if (sortOption === 'productListing.sortOptions.priceHighLow') {
        filteredData = [...filteredData].sort((a, b) => b.price - a.price);
      } else if (sortOption === 'productListing.sortOptions.newest') {
        filteredData = [...filteredData].reverse();
      }
    }

    const startIndex = (page - 1) * limit;
    const paginatedData = filteredData.slice(startIndex, startIndex + limit);

    return {
      products: paginatedData,
      totalCount: filteredData.length,
      hasMore: startIndex + limit < filteredData.length
    };
  }

  /**
   * Get product by ID
   */
  static getProductById(id: string) {
    return MOCK_PRODUCTS.find(p => p.id === id);
  }

  /**
   * Get products by a specific tag (for Home Screen quick filters)
   */
  static getProductsByTag(tag: string, limit: number = 20) {
    let filteredData = MOCK_PRODUCTS;

    // Check against the 'all' key or the localized 'all' string
    if (tag === 'all' || tag === STRINGS.homeScreen.tags.all) return filteredData.slice(0, limit);
    
    filteredData = filteredData.filter(p => p.tags?.includes(tag));

    return filteredData.slice(0, limit);
  }
}
