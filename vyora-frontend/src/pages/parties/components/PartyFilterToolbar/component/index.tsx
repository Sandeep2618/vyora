import React from 'react';
import { Filter, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { BalanceFilter } from '@/pages/parties/config';
import { PartyFilterToolbarProps } from '../config/interface';

export const PartyFilterToolbar: React.FC<PartyFilterToolbarProps> = ({
  activeTab,
  setActiveTab,
  search,
  setSearch,
  balanceFilter,
  setBalanceFilter,
  stateFilter,
  setStateFilter,
  showFilters,
  setShowFilters,
  availableStates,
  hasActiveFilters,
  onClearFilters,
}) => {
  const { t } = useTranslation(['parties', 'common']);

  const stateOptions = [
    { value: 'ALL', label: t('filter.allStates', { defaultValue: 'All States' }) },
    ...availableStates.map((st) => ({ value: st, label: st })),
  ];

  const balanceOptions = [
    { value: 'ALL', label: t('filter.allBalances', { defaultValue: 'All Balances' }) },
    { value: 'DUE', label: t('filter.balanceDue', { defaultValue: 'Balance Due' }) },
    { value: 'SETTLED', label: t('filter.settledZero', { defaultValue: 'Settled (Zero)' }) },
  ];

  return (
    <div className="space-y-3">
      {/* Tab Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Toggle between Customers and Suppliers */}
        <div className="flex items-center p-1 bg-[#F4F8F7] dark:bg-[#162E2D] rounded-xl border border-[#D7E5E2] dark:border-[#1E3B38] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('CUSTOMER')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'CUSTOMER'
                ? 'bg-white dark:bg-[#112322] text-[#0F766E] dark:text-[#14B8A6] shadow-xs'
                : 'text-[#566B69] dark:text-[#8FA8A4] hover:text-[#123B3A] dark:hover:text-[#E6F4F1]'
            }`}
          >
            {t('tab.customers')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SUPPLIER')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'SUPPLIER'
                ? 'bg-white dark:bg-[#112322] text-[#0F766E] dark:text-[#14B8A6] shadow-xs'
                : 'text-[#566B69] dark:text-[#8FA8A4] hover:text-[#123B3A] dark:hover:text-[#E6F4F1]'
            }`}
          >
            {t('tab.suppliers')}
          </button>
        </div>

        {/* Search & Toggle Filters Button */}
        <div className="flex items-center gap-2 flex-1 max-w-md ml-auto">
          <SearchInput
            placeholder={t('actions.search', { ns: 'common' })}
            value={search}
            onChange={(val) => setSearch(val)}
            className="w-full"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 shrink-0 ${
              showFilters || hasActiveFilters ? 'border-[#0F766E] dark:border-[#14B8A6] text-[#0F766E] dark:text-[#14B8A6]' : ''
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('actions.filter', { ns: 'common' })}</span>
          </Button>
        </div>
      </div>

      {/* Expandable Filter Drawer */}
      {showFilters && (
        <div className="p-3.5 bg-[#F4F8F7] dark:bg-[#162E2D] rounded-xl border border-[#D7E5E2] dark:border-[#1E3B38] grid grid-cols-1 sm:grid-cols-3 gap-3 items-end animate-in fade-in">
          <Select
            label={t('filter.balanceStatus', { defaultValue: 'Balance Status' })}
            value={balanceFilter}
            onValueChange={(val) => setBalanceFilter(val as BalanceFilter)}
            options={balanceOptions}
          />

          <Select
            label={t('filter.stateProvince', { defaultValue: 'State / Province' })}
            value={stateFilter}
            onValueChange={(val) => setStateFilter(val)}
            options={stateOptions}
          />

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="flex items-center gap-1 text-xs text-[#B91C1C] dark:text-rose-400 hover:bg-[#FEE2E2] dark:hover:bg-rose-950/40"
              >
                <X className="w-3.5 h-3.5" />
                <span>{t('actions.reset', { ns: 'common' })}</span>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
