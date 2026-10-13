import React from 'react';
import { Filter, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { PaymentsFilterToolbarProps } from '../config/interface';

export const PaymentsFilterToolbar: React.FC<PaymentsFilterToolbarProps> = ({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  methodFilter,
  onMethodFilterChange,
  showFilters,
  onToggleFilters,
  onClearFilters,
  hasActiveFilters,
  totalCount,
}) => {
  const { t } = useTranslation(['payments', 'common']);

  return (
    <div className="space-y-3">
      {/* Filter Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onToggleFilters}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 cursor-pointer ${
              showFilters || typeFilter !== 'ALL' || methodFilter !== 'ALL'
                ? 'bg-[#E6F4F2] dark:bg-[#162E2D] border-[#0F766E] text-[#0F766E] dark:text-[#14B8A6]'
                : 'bg-[#F4F8F7] dark:bg-[#162E2D] border-[#D7E5E2] dark:border-[#1E3B38] text-[#566B69] dark:text-[#8FA8A4] hover:text-[#123B3A] dark:hover:text-[#F0FDFA]'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{t('actions.filter', { ns: 'common' })}</span>
            {(typeFilter !== 'ALL' || methodFilter !== 'ALL') && (
              <span className="w-2 h-2 rounded-full bg-[#0F766E] dark:bg-[#14B8A6]" />
            )}
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="px-2.5 py-1.5 text-xs font-medium text-[#B91C1C] dark:text-rose-400 hover:bg-[#FEF2F2] dark:hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>{t('actions.reset', { ns: 'common' })}</span>
            </button>
          )}

          <div className="text-xs text-[#566B69] dark:text-[#8FA8A4] font-medium hidden sm:block">
            {t('columns.amount', { defaultValue: 'Records' })}: <span className="font-bold text-[#123B3A] dark:text-[#E6F4F1]">{totalCount}</span>
          </div>
        </div>

        <div className="w-full lg:w-72 shrink-0">
          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder={t('actions.search', { ns: 'common' })}
            className="w-full"
          />
        </div>
      </div>

      {/* Filter Toolbar Drawer */}
      {showFilters && (
        <div className="p-3.5 bg-[#F4F8F7] dark:bg-[#162E2D] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
          <Select
            label={t('filter.voucherType', { defaultValue: 'Voucher Type' })}
            value={typeFilter}
            onValueChange={(val) => onTypeFilterChange(val as any)}
            options={[
              { label: t('filter.all'), value: 'ALL' },
              { label: t('filter.receipt'), value: 'RECEIPT' },
              { label: t('filter.payment'), value: 'PAYMENT' },
            ]}
          />

          <Select
            label={t('filter.paymentMethod', { defaultValue: 'Payment Method' })}
            value={methodFilter}
            onValueChange={onMethodFilterChange}
            options={[
              { label: t('filter.allMethods'), value: 'ALL' },
              { label: t('filter.bankTransfer'), value: 'BANK_TRANSFER' },
              { label: t('filter.upi'), value: 'UPI' },
              { label: t('filter.cash'), value: 'CASH' },
              { label: t('filter.cheque'), value: 'CHEQUE' },
            ]}
          />
        </div>
      )}
    </div>
  );
};
