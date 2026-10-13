import { Product } from '@/types';

export interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  hasActiveFilters?: boolean;
  isOwner?: boolean;
  onResetFilters?: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onAddFirst: () => void;
}
