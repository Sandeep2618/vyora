import { MovementTypeFilter } from '@/pages/inventory/config';

export interface InventoryFilterToolbarProps {
  search: string;
  setSearch: (s: string) => void;
  movementTypeFilter: MovementTypeFilter;
  setMovementTypeFilter: (t: MovementTypeFilter) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}
