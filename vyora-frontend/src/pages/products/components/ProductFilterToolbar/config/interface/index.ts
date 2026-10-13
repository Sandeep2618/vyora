import { StockFilter } from '@/pages/products/config';

export interface ProductFilterToolbarProps {
  search: string;
  setSearch: (s: string) => void;
  stockFilter: StockFilter;
  setStockFilter: (s: StockFilter) => void;
  taxFilter: string;
  setTaxFilter: (t: string) => void;
  unitFilter: string;
  setUnitFilter: (u: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}
