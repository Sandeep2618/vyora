import { InvoiceTabFilter, InvoiceTimeFilter } from '@/pages/invoices/config';

export interface InvoiceFilterToolbarProps {
  activeTab: InvoiceTabFilter;
  setActiveTab: (tab: InvoiceTabFilter) => void;
  search: string;
  setSearch: (s: string) => void;
  timeFilter: InvoiceTimeFilter;
  setTimeFilter: (t: InvoiceTimeFilter) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}
