import { PartyType } from '../../../types';

export type BalanceFilter = 'ALL' | 'DUE' | 'SETTLED';

export interface PartyFilterOptions {
  search: string;
  balanceFilter: BalanceFilter;
  stateFilter: string;
}

export const BALANCE_FILTER_OPTIONS: { value: BalanceFilter; label: string }[] = [
  { value: 'ALL', label: 'All Balances' },
  { value: 'DUE', label: 'Balance Due' },
  { value: 'SETTLED', label: 'Settled (Zero)' },
];
