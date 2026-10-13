import {
  FileText,
  Users,
  Building2,
  History,
  CreditCard,
} from 'lucide-react';
import { ModuleRightItem } from '../interface';

export const MODULE_RIGHTS_METADATA: ModuleRightItem[] = [
  {
    key: 'invoices',
    title: 'Sales Invoices & Billing',
    desc: 'Create counter bills, manage GST invoices, and track customer receivables.',
    icon: FileText,
  },
  {
    key: 'parties',
    title: 'Customers & Suppliers',
    desc: 'Access party directory, phone contacts, and outstanding ledger balances.',
    icon: Users,
  },
  {
    key: 'products',
    title: 'Products & Services Catalog',
    desc: 'Browse inventory catalog, prices, and stock quantities.',
    icon: Building2,
  },
  {
    key: 'inventory',
    title: 'Inventory Movements & Audit',
    desc: 'Track live stock movement history, adjustments, and reorder alerts.',
    icon: History,
  },
  {
    key: 'purchases',
    title: 'Purchase Bills & Vendors',
    desc: 'Record supplier purchase bills and receive incoming inventory.',
    icon: CreditCard,
  },
  {
    key: 'payments',
    title: 'Cash & Bank Payments',
    desc: 'Record customer receipts, vendor payments, and expense vouchers.',
    icon: CreditCard,
  },
  {
    key: 'reports',
    title: 'Financial & Tax Reports',
    desc: 'Generate GSTR-1, GSTR-3B summaries, profit & loss, and ledger statements.',
    icon: FileText,
  },
];
