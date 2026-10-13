import { Party } from '@/types';

export interface DeletePartyModalProps {
  party: Party | null;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}
