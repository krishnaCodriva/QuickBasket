import { STRINGS, Colors } from '../constants';
import type { Banner, Category, SubCategory } from '../core/types/domain';

export const CATEGORIES: Category[] = [
  { id: "fruits", nameKey: STRINGS.common.categories.fruits, emoji: "🍎", colorName: "red100" },
  { id: "veg", nameKey: STRINGS.common.categories.veg, emoji: "🥕", colorName: "green100" },
  { id: "dairy", nameKey: STRINGS.common.categories.dairy, emoji: "🥛", colorName: "blue100" },
  { id: "bakery", nameKey: STRINGS.common.categories.bakery, emoji: "🍞", colorName: "orange100" },
  { id: "meat", nameKey: STRINGS.common.categories.meat, emoji: "🥩", colorName: "pink100" },
  { id: "snacks", nameKey: STRINGS.common.categories.snacks, emoji: "🍿", colorName: "yellow100" },
  { id: "drinks", nameKey: STRINGS.common.categories.drinks, emoji: "🥤", colorName: "indigo100" },
  { id: "frozen", nameKey: STRINGS.common.categories.frozen, emoji: "🧊", colorName: "cyan100" },
];

export const MOCK_SUB_CATEGORIES: any[] = [
  { id: "fresh-fruits", categoryId: "fruits", nameKey: "Fresh Fruits", imageUrl: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=400&auto=format&fit=crop" },
  { id: "exotic-fruits", categoryId: "fruits", nameKey: "Exotic Fruits", imageUrl: "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?q=80&w=400&auto=format&fit=crop" },
  { id: "leafy-veg", categoryId: "veg", nameKey: "Leafy Greens", imageUrl: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=400&auto=format&fit=crop" },
  { id: "root-veg", categoryId: "veg", nameKey: "Root Veggies", imageUrl: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?q=80&w=400&auto=format&fit=crop" },
  { id: "milk", categoryId: "dairy", nameKey: "Milk", imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=400&auto=format&fit=crop" },
  { id: "cheese", categoryId: "dairy", nameKey: "Cheese & Butter", imageUrl: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?q=80&w=400&auto=format&fit=crop" },
  { id: "bread", categoryId: "bakery", nameKey: "Breads", imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=400&auto=format&fit=crop" },
  { id: "pastry", categoryId: "bakery", nameKey: "Pastries & Cakes", imageUrl: "https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?q=80&w=400&auto=format&fit=crop" },
  { id: "chicken", categoryId: "meat", nameKey: "Chicken", imageUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=400&auto=format&fit=crop" },
  { id: "beef", categoryId: "meat", nameKey: "Beef & Mutton", imageUrl: "https://images.unsplash.com/photo-1603048297172-c92544798d5e?q=80&w=400&auto=format&fit=crop" },
  { id: "chips", categoryId: "snacks", nameKey: "Chips & Crisps", imageUrl: "https://images.unsplash.com/photo-1566478989037-e987ce24338d?q=80&w=400&auto=format&fit=crop" },
  { id: "chocolates", categoryId: "snacks", nameKey: "Chocolates", imageUrl: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=400&auto=format&fit=crop" },
  { id: "sodas", categoryId: "drinks", nameKey: "Sodas & Juices", imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400&auto=format&fit=crop" },
  { id: "water", categoryId: "drinks", nameKey: "Water & Soda", imageUrl: "https://images.unsplash.com/photo-1548839140-29a749e1abc5?q=80&w=400&auto=format&fit=crop" },
  { id: "ice-cream", categoryId: "frozen", nameKey: "Ice Creams", imageUrl: "https://images.unsplash.com/photo-1570197781417-0a523757bf02?q=80&w=400&auto=format&fit=crop" },
  { id: "frozen-meals", categoryId: "frozen", nameKey: "Frozen Meals", imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop" },
];

export const HOME_BANNERS: Banner[] = [
  {
    id: "1",
    source: require("../../assets/Section - Hero Carousel (Bento Style).png"),
    linkType: "category",
    linkTarget: STRINGS.common.categories.fruits,
  },
  {
    id: "2",
    source: require("../../assets/banner1.jpg"),
    linkType: "offer",
    linkTarget: "Avocado",
  },
  {
    id: "3",
    source: require("../../assets/banner2.jpg"),
    linkType: "product",
    linkTarget: "1",
  },
];

export const INITIAL_ADDRESSES = [
  { id: 'addr_1', label: 'home', address: '123 Main St, Springfield, IL 62701', fullName: 'John Doe', mobile: '1234567890', flat: '123', street: 'Main St', landmark: '', city: 'Springfield', state: 'IL', pincode: '62701', type: 'home' },
  { id: 'addr_2', label: 'work', address: '456 Business Rd, Suite 200, Springfield, IL 62704', fullName: 'John Doe', mobile: '1234567890', flat: 'Suite 200', street: 'Business Rd', landmark: '', city: 'Springfield', state: 'IL', pincode: '62704', type: 'work' }
];

export const MOCK_PAYMENT_METHODS = [
  { id: 'pm_cod', label: 'Cash on Delivery', details: 'Pay when your order arrives' },
  { id: 'pm_debit', label: 'Debit Card', details: 'Pay using your bank debit card' },
  { id: 'pm_credit', label: 'Credit Card', details: '**** **** **** 1234' },
  { id: 'pm_upi', label: 'UPI', details: 'Google Pay, PhonePe, Paytm, etc.' },
  { id: 'pm_netbanking', label: 'Net Banking', details: 'All major banks available' }
];

export const MOCK_PRODUCTS = [
  { id: '1', name: 'Organic Hass Avocados, 4 Pack', price: 5.99, mrp: 7.99, weight: 'Fresh Produce', emoji: '🥑', categoryId: 'fruits', subCategoryId: 'fresh-fruits', category: STRINGS.common.categories.fruits, inStock: true, tags: [STRINGS.homeScreen.tags.fresh, STRINGS.homeScreen.tags.bestSelling] },
  { id: '2', name: 'Large Fuerte Avocado, Single', price: 2.49, mrp: 3.00, weight: 'Local Farm', emoji: '🥑', categoryId: 'fruits', subCategoryId: 'fresh-fruits', category: STRINGS.common.categories.fruits, inStock: true, tags: [STRINGS.homeScreen.tags.fresh] },
  { id: '3', name: 'Artisan Smashed Avocado', price: 4.99, mrp: 6.50, weight: 'Pantry • 200g', emoji: '🥑', categoryId: 'fruits', subCategoryId: 'fresh-fruits', category: STRINGS.common.categories.fruits, inStock: true, tags: [STRINGS.homeScreen.tags.dailyEssentials] },
  { id: '4', name: 'Cold Pressed Avocado Oil', price: 12.50, mrp: 15.00, weight: 'Cooking Oils • 500ml', emoji: '🥑', categoryId: 'fruits', subCategoryId: 'fresh-fruits', category: STRINGS.common.categories.fruits, inStock: true, tags: [STRINGS.homeScreen.tags.trending] },
  { id: '5', name: 'Pre-Sliced Hass Avocado', price: 3.99, mrp: 5.00, weight: 'Ready to Eat • 150g', emoji: '🥑', categoryId: 'fruits', subCategoryId: 'fresh-fruits', category: STRINGS.common.categories.fruits, inStock: false, tags: [STRINGS.homeScreen.tags.fastDelivery] },
  { id: '6', name: 'Frozen Avocado Chunks', price: 9.99, mrp: 12.00, weight: 'Frozen • 1kg', emoji: '🥑', categoryId: 'frozen', subCategoryId: 'frozen-meals', category: STRINGS.common.categories.frozen, inStock: true, tags: [STRINGS.homeScreen.tags.recommended] },
  { id: '7', name: 'Premium Fairtrade Bananas', price: 2.99, mrp: 4.00, weight: 'Bunch, ~1kg', emoji: '🍌', categoryId: 'fruits', subCategoryId: 'fresh-fruits', category: STRINGS.common.categories.fruits, inStock: true, tags: [STRINGS.homeScreen.tags.fresh, STRINGS.homeScreen.tags.bestSelling, STRINGS.homeScreen.tags.dailyEssentials] },
  { id: '8', name: 'Alpine Sparkling Water', price: 1.49, mrp: 2.00, weight: '1L Bottle', emoji: '💧', categoryId: 'drinks', subCategoryId: 'sodas', category: STRINGS.common.categories.drinks, inStock: true, tags: [STRINGS.homeScreen.tags.dailyEssentials, STRINGS.homeScreen.tags.fastDelivery] },
  { id: '9', name: 'Whole Milk', price: 3.50, mrp: 4.50, weight: '1 Gallon', emoji: '🥛', categoryId: 'dairy', subCategoryId: 'milk', category: STRINGS.common.categories.dairy, inStock: true, tags: [STRINGS.homeScreen.tags.dailyEssentials, STRINGS.homeScreen.tags.fresh, STRINGS.homeScreen.tags.bestSelling] },
  { id: '10', name: 'Sourdough Bread Loaf', price: 4.99, mrp: 6.00, weight: 'Freshly Baked', emoji: '🍞', categoryId: 'bakery', subCategoryId: 'bread', category: STRINGS.common.categories.bakery, inStock: true, tags: [STRINGS.homeScreen.tags.fresh, STRINGS.homeScreen.tags.trending] },
  { id: '11', name: 'Red Apples', price: 5.00, mrp: 6.50, weight: 'Bag • 1.5kg', emoji: '🍎', categoryId: 'fruits', subCategoryId: 'fresh-fruits', category: STRINGS.common.categories.fruits, inStock: true, tags: [STRINGS.homeScreen.tags.fresh] },
  { id: '12', name: 'Green Apples', price: 4.50, mrp: 5.50, weight: 'Bag • 1kg', emoji: '🍏', categoryId: 'fruits', subCategoryId: 'fresh-fruits', category: STRINGS.common.categories.fruits, inStock: true, tags: [STRINGS.homeScreen.tags.fresh, STRINGS.homeScreen.tags.recommended] },
  { id: '13', name: 'Carrots', price: 2.00, mrp: 2.50, weight: 'Bag • 1kg', emoji: '🥕', categoryId: 'veg', subCategoryId: 'leafy-veg', category: STRINGS.common.categories.veg, inStock: false, tags: [STRINGS.homeScreen.tags.fresh, STRINGS.homeScreen.tags.dailyEssentials] },
  { id: '14', name: 'Broccoli', price: 3.00, mrp: 4.00, weight: 'Bunch', emoji: '🥦', categoryId: 'veg', subCategoryId: 'leafy-veg', category: STRINGS.common.categories.veg, inStock: true, tags: [STRINGS.homeScreen.tags.fresh, STRINGS.homeScreen.tags.newArrivals] },
  { id: '15', name: 'Orange Juice', price: 6.00, mrp: 7.50, weight: '1L', emoji: '🍊', categoryId: 'drinks', subCategoryId: 'sodas', category: STRINGS.common.categories.drinks, inStock: true, tags: [STRINGS.homeScreen.tags.dailyEssentials, STRINGS.homeScreen.tags.bestSelling] },
  { id: '16', name: 'Lemon', price: 0.50, mrp: 0.80, weight: 'Single', emoji: '🍋', categoryId: 'fruits', subCategoryId: 'fresh-fruits', category: STRINGS.common.categories.fruits, inStock: true, tags: [STRINGS.homeScreen.tags.fresh] },
  { id: '17', name: 'Strawberries', price: 4.50, mrp: 6.00, weight: 'Punnet • 250g', emoji: '🍓', categoryId: 'fruits', subCategoryId: 'fresh-fruits', category: STRINGS.common.categories.fruits, inStock: true, tags: [STRINGS.homeScreen.tags.fresh, STRINGS.homeScreen.tags.trending] },
  { id: '18', name: 'Blueberries', price: 5.50, mrp: 7.00, weight: 'Punnet • 250g', emoji: '🫐', categoryId: 'fruits', subCategoryId: 'fresh-fruits', category: STRINGS.common.categories.fruits, inStock: true, tags: [STRINGS.homeScreen.tags.fresh, STRINGS.homeScreen.tags.recommended] },
  { id: '19', name: 'Watermelon', price: 8.00, mrp: 10.00, weight: 'Whole', emoji: '🍉', categoryId: 'fruits', subCategoryId: 'fresh-fruits', category: STRINGS.common.categories.fruits, inStock: false, tags: [STRINGS.homeScreen.tags.fresh] },
  { id: '20', name: 'Grapes', price: 6.50, mrp: 8.00, weight: 'Bunch • 500g', emoji: '🍇', categoryId: 'fruits', subCategoryId: 'fresh-fruits', category: STRINGS.common.categories.fruits, inStock: true, tags: [STRINGS.homeScreen.tags.fresh, STRINGS.homeScreen.tags.fastDelivery] },
  { id: '21', name: 'Fresh Chicken Breast', price: 7.99, mrp: 9.50, weight: 'Pack • 500g', emoji: '🍗', categoryId: 'meat', subCategoryId: 'chicken', category: STRINGS.common.categories.meat, inStock: true, tags: [STRINGS.homeScreen.tags.fresh, STRINGS.homeScreen.tags.bestSelling] },
  { id: '22', name: 'Premium Ground Beef', price: 8.50, mrp: 10.00, weight: 'Pack • 450g', emoji: '🥩', categoryId: 'meat', subCategoryId: 'chicken', category: STRINGS.common.categories.meat, inStock: true, tags: [STRINGS.homeScreen.tags.fresh] },
  { id: '23', name: 'Almond Milk', price: 3.99, mrp: 4.50, weight: '1L', emoji: '🥛', categoryId: 'dairy', subCategoryId: 'milk', category: STRINGS.common.categories.dairy, inStock: true, tags: [STRINGS.homeScreen.tags.dailyEssentials, STRINGS.homeScreen.tags.trending] },
  { id: '24', name: 'Cheddar Cheese Block', price: 5.50, mrp: 6.50, weight: '250g', emoji: '🧀', categoryId: 'dairy', subCategoryId: 'milk', category: STRINGS.common.categories.dairy, inStock: true, tags: [STRINGS.homeScreen.tags.fresh] },
  { id: '25', name: 'Greek Yogurt', price: 1.99, mrp: 2.50, weight: '150g', emoji: '🥣', categoryId: 'dairy', subCategoryId: 'milk', category: STRINGS.common.categories.dairy, inStock: true, tags: [STRINGS.homeScreen.tags.dailyEssentials] },
  { id: '26', name: 'Eggs, 1 Dozen', price: 2.99, mrp: 3.50, weight: '12 Pack', emoji: '🥚', categoryId: 'dairy', subCategoryId: 'milk', category: STRINGS.common.categories.dairy, inStock: true, tags: [STRINGS.homeScreen.tags.dailyEssentials, STRINGS.homeScreen.tags.bestSelling] },
  { id: '27', name: 'Butter', price: 4.50, mrp: 5.00, weight: '200g', emoji: '🧈', categoryId: 'dairy', subCategoryId: 'milk', category: STRINGS.common.categories.dairy, inStock: true, tags: [STRINGS.homeScreen.tags.dailyEssentials] },
  { id: '28', name: 'Croissant', price: 1.50, mrp: 2.00, weight: 'Single', emoji: '🥐', categoryId: 'bakery', subCategoryId: 'bread', category: STRINGS.common.categories.bakery, inStock: true, tags: [STRINGS.homeScreen.tags.fresh, STRINGS.homeScreen.tags.fastDelivery] },
  { id: '29', name: 'Baguette', price: 2.50, mrp: 3.00, weight: 'Single', emoji: '🥖', categoryId: 'bakery', subCategoryId: 'bread', category: STRINGS.common.categories.bakery, inStock: true, tags: [STRINGS.homeScreen.tags.fresh] },
  { id: '30', name: 'Chocolate Chip Cookies', price: 3.50, mrp: 4.00, weight: 'Pack of 6', emoji: '🍪', categoryId: 'bakery', subCategoryId: 'bread', category: STRINGS.common.categories.bakery, inStock: true, tags: [STRINGS.homeScreen.tags.trending] },
  { id: '31', name: 'Potato Chips', price: 2.50, mrp: 3.00, weight: '150g', emoji: '🥔', categoryId: 'snacks', subCategoryId: 'chips', category: STRINGS.common.categories.snacks, inStock: true, tags: [STRINGS.homeScreen.tags.bestSelling] },
  { id: '32', name: 'Mixed Nuts', price: 6.99, mrp: 8.00, weight: '200g', emoji: '🥜', categoryId: 'snacks', subCategoryId: 'chips', category: STRINGS.common.categories.snacks, inStock: true, tags: [STRINGS.homeScreen.tags.recommended] },
  { id: '33', name: 'Dark Chocolate Bar', price: 3.00, mrp: 4.00, weight: '100g', emoji: '🍫', categoryId: 'snacks', subCategoryId: 'chips', category: STRINGS.common.categories.snacks, inStock: true, tags: [STRINGS.homeScreen.tags.trending] },
  { id: '34', name: 'Popcorn', price: 1.99, mrp: 2.50, weight: '100g', emoji: '🍿', categoryId: 'snacks', subCategoryId: 'chips', category: STRINGS.common.categories.snacks, inStock: true, tags: [STRINGS.homeScreen.tags.fastDelivery] },
  { id: '35', name: 'Frozen Pizza', price: 5.99, mrp: 7.00, weight: '400g', emoji: '🍕', categoryId: 'frozen', subCategoryId: 'frozen-meals', category: STRINGS.common.categories.frozen, inStock: true, tags: [STRINGS.homeScreen.tags.bestSelling] },
  { id: '36', name: 'Ice Cream Tub', price: 4.99, mrp: 6.00, weight: '500ml', emoji: '🍦', categoryId: 'frozen', subCategoryId: 'frozen-meals', category: STRINGS.common.categories.frozen, inStock: true, tags: [STRINGS.homeScreen.tags.trending, STRINGS.homeScreen.tags.recommended] },
  { id: '37', name: 'Frozen Peas', price: 2.50, mrp: 3.00, weight: '500g', emoji: '🟢', categoryId: 'frozen', subCategoryId: 'frozen-meals', category: STRINGS.common.categories.frozen, inStock: true, tags: [STRINGS.homeScreen.tags.dailyEssentials] },
];

export const MOCK_RECENT_SEARCHES = [
  { id: '1', title: 'Sector 137', subtitle: 'Noida, Uttar Pradesh' },
  { id: '2', title: 'Pari Chowk', subtitle: 'Greater Noida, Uttar Pradesh' },
];

export const MOCK_POPULAR_AREAS = [
  { id: '1', title: 'Cyber Hub', subtitle: 'DLF Phase 2, Gurugram' },
  { id: '2', title: 'Hauz Khas Village', subtitle: 'South Delhi, New Delhi' },
  { id: '3', title: 'Connaught Place', subtitle: 'Rajiv Chowk, New Delhi' },
];
