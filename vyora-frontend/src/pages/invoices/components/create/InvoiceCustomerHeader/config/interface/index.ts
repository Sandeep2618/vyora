import { Party } from '@/types';

export interface InvoiceCustomerHeaderProps {
  customers: Party[];
  selectedCustomerId: string;
  onCustomerChange: (id: string) => void;
  onAddNewCustomer: () => void;
  issueDate: string;
  onIssueDateChange: (date: string) => void;
  paymentTerms: string;
  onPaymentTermsChange: (terms: string) => void;
  dueDate: string;
  onDueDateChange: (date: string) => void;
}
