export interface PaymentsFilterToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  typeFilter: 'ALL' | 'RECEIPT' | 'PAYMENT';
  onTypeFilterChange: (type: 'ALL' | 'RECEIPT' | 'PAYMENT') => void;
  methodFilter: string;
  onMethodFilterChange: (method: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  totalCount: number;
}
