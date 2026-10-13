import { Party, PartyType } from '@/types';

export interface PartyTableProps {
  parties: Party[];
  isLoading: boolean;
  partyType: PartyType;
  hasActiveFilters?: boolean;
  isOwner?: boolean;
  onResetFilters?: () => void;
  onEdit: (party: Party) => void;
  onDelete: (party: Party) => void;
  onAddFirst: () => void;
}
