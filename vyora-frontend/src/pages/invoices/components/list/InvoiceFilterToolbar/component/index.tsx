import React from 'react';
import { Filter, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { InvoiceTimeFilter } from '@/pages/invoices/config';
import { InvoiceFilterToolbarProps } from '../config/interface';
import { INVOICE_TAB_OPTIONS, INVOICE_TIME_OPTIONS } from '../config/constant';

export const InvoiceFilterToolbar: React.FC<InvoiceFilterToolbarProps> = ({
  activeTab,
  setActiveTab,
  search,
  setSearch,
  timeFilter,
  setTimeFilter,
  showFilters,
  setShowFilters,
  hasActiveFilters,
  onClearFilters,
}) => {
  const { t } = useTranslation(['invoices', 'common']);

  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Status Tabs and Filter Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-[#F4F8F7] dark:bg-[#162E2D] p-1 rounded-xl border border-[#D7E5E2] dark:border-[#1E3B38] overflow-x-auto max-w-full">
            {INVOICE_TAB_OPTIONS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === tab.value
                    ? 'bg-white dark:bg-[#112322] text-[#0F766E] dark:text-[#14B8A6] shadow-2xs font-bold'
                    : 'text-[#566B69] dark:text-[#8FA8A4] hover:text-[#123B3A] dark:hover:text-[#E6F4F1]'
                }`}
              >
                {t(tab.labelKey, { ns: 'common', defaultValue: tab.value })}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 cursor-pointer ${
              showFilters || timeFilter !== 'ALL'
                ? 'bg-[#E6F4F2] dark:bg-[#162E2D] border-[#0F766E] dark:border-[#14B8A6] text-[#0F766E] dark:text-[#14B8A6]'
                : 'bg-[#F4F8F7] dark:bg-[#162E2D] border-[#D7E5E2] dark:border-[#1E3B38] text-[#566B69] dark:text-[#8FA8A4] hover:text-[#123B3A] dark:hover:text-[#E6F4F1]'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{t('actions.filter', { ns: 'common' })}</span>
            {timeFilter !== 'ALL' && <span className="w-2 h-2 rounded-full bg-[#0F766E] dark:bg-[#14B8A6]" />}
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="px-2.5 py-1.5 text-xs font-medium text-[#B91C1C] dark:text-rose-400 hover:bg-[#FEF2F2] dark:hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t('actions.reset', { ns: 'common' })}</span>
            </button>
          )}
        </div>

        {/* Search */}
        <div className="w-full lg:w-72">
          <SearchInput
            placeholder={t('actions.search', { ns: 'common' })}
            value={search}
            onChange={(val) => setSearch(val)}
          />
        </div>
      </div>

      {/* Expandable Filter Drawer */}
      {showFilters && (
        <div className="p-3 bg-[#F4F8F7] dark:bg-[#162E2D] rounded-xl border border-[#D7E5E2] dark:border-[#1E3B38] flex flex-wrap items-center gap-4 animate-in fade-in">
          <div className="w-52">
            <Select
              label={t('timeframe.label', { ns: 'common', defaultValue: 'Issue Date Timeframe' })}
              value={timeFilter}
              onValueChange={(val) => setTimeFilter(val as InvoiceTimeFilter)}
              options={INVOICE_TIME_OPTIONS.map((opt) => ({
                value: opt.value,
                label: t(opt.labelKey, { ns: 'common', defaultValue: opt.defaultLabel }),
              }))}
            />
          </div>
        </div>
      )}
    </div>
  );
};
