import { Party, PartyType } from '@/types';

export interface PartyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  partyType: PartyType;
  partyToEdit?: Party | null;
}
