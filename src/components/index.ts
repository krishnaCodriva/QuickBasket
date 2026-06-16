// ─── Themed primitives ────────────────────────────────────────────────────────
export * from './ThemedView';
export * from './ThemedText';
export * from './TranslatedText';
export * from './SearchAndFilterBar';

// ─── Layout ───────────────────────────────────────────────────────────────────
export { RefreshableScrollView } from './RefreshableScrollView';
/** Reusable screen header with back button, centred title, and optional right element */
export { ScreenHeader } from './ScreenHeader';
export type { ScreenHeaderProps } from './ScreenHeader';

/** Consistent bottom-sheet modal with backdrop, handle, and keyboard-avoidance */
export { BottomSheetModal } from './BottomSheetModal';
export type { BottomSheetModalProps } from './BottomSheetModal';

// ─── Inputs ───────────────────────────────────────────────────────────────────
/** Primary themed search / text input (icon + clear button) */
export { default as ThemedInput } from './ThemedInput';

/** Labelled form input with error/success validation states */
export { FormInput } from './FormInput';
export type { FormInputProps } from './FormInput';

// ─── Buttons ─────────────────────────────────────────────────────────────────
export * from './CustomButton';

// ─── Data display ─────────────────────────────────────────────────────────────
/** Numeric / dot / label badge */
export { Badge } from './Badge';
export type { BadgeProps } from './Badge';

/** Pill-shaped filter / category / status tag */
export { Tag } from './Tag';
export type { TagProps } from './Tag';

/** Price + MRP strikethrough + discount badge */
export { PriceDisplay } from './PriceDisplay';
export type { PriceDisplayProps } from './PriceDisplay';

// ─── State feedback ───────────────────────────────────────────────────────────
/** Spinner for fullscreen / inline / overlay loading states */
export { LoadingState } from './LoadingState';
export type { LoadingStateProps } from './LoadingState';

/** Error display with retry and secondary action */
export { ErrorState } from './ErrorState';
export type { ErrorStateProps } from './ErrorState';

/** Empty content state with icon, title, subtitle, and actions */
export { default as EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';

// ─── Product ──────────────────────────────────────────────────────────────────
export { default as ProductCard } from './ProductCard';
export { default as ActiveFilterChips } from './ActiveFilterChips';
export { default as ProductFilterModal } from './ProductFilterModal';
export { default as QuantitySelector } from './QuantitySelector';
export { default as CartHeaderIcon } from './CartHeaderIcon';

// ─── Cart ─────────────────────────────────────────────────────────────────────
export { default as CartItemCard } from './Cart/CartItemCard';
export { default as CartPriceSummary } from './Cart/CartPriceSummary';
export { default as CartWarningBanner } from './Cart/CartWarningBanner';

// ─── Categories ───────────────────────────────────────────────────────────────
export { default as ImageCategoryCard } from './Categories/ImageCategoryCard';
export { default as SortModal } from './SortModal';
