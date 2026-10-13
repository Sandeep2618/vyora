import { PartyType } from '@/types';
import { BalanceFilter } from '@/pages/parties/config';

export interface PartyFilterToolbarProps {
  activeTab: PartyType;
  setActiveTab: (tab: PartyType) => void;
  search: string;
  setSearch: (s: string) => void;
  balanceFilter: BalanceFilter;
  setBalanceFilter: (b: BalanceFilter) => void;
  stateFilter: string;
  setStateFilter: (s: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  availableStates: string[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}
