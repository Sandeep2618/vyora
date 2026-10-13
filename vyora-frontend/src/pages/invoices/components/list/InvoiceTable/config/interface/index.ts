import { Invoice } from '@/types';

export interface InvoiceTableProps {
  invoices: Invoice[];
  isLoading: boolean;
  hasActiveFilters?: boolean;
  isOwner?: boolean;
  onResetFilters?: () => void;
  onFinalize: (id: string) => void;
  onCancelClick: (invoice: Invoice) => void;
  onCreateClick: () => void;
}
