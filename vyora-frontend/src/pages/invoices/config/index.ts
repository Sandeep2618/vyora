export type InvoiceTabFilter = 'ALL' | 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELLED';
export type InvoiceTimeFilter = 'ALL' | 'TODAY' | 'THIS_MONTH' | 'LAST_30';

export const INVOICE_TAB_OPTIONS: { value: InvoiceTabFilter; labelKey: string }[] = [
  { value: 'ALL', labelKey: 'status.all' },
  { value: 'PAID', labelKey: 'status.paid' },
  { value: 'PENDING', labelKey: 'status.pending' },
  { value: 'OVERDUE', labelKey: 'status.overdue' },
  { value: 'CANCELLED', labelKey: 'status.cancelled' },
];

export const INVOICE_TIME_OPTIONS: { value: InvoiceTimeFilter; labelKey: string; defaultLabel: string }[] = [
  { value: 'ALL', labelKey: 'timeframe.allDates', defaultLabel: 'All Dates' },
  { value: 'TODAY', labelKey: 'timeframe.today', defaultLabel: 'Today' },
  { value: 'THIS_MONTH', labelKey: 'timeframe.thisMonth', defaultLabel: 'This Month' },
  { value: 'LAST_30', labelKey: 'timeframe.last30Days', defaultLabel: 'Last 30 Days' },
];
