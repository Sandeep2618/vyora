import React from 'react';
import { Filter, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { MovementTypeFilter } from '@/pages/inventory/config';
import { InventoryFilterToolbarProps } from '../config/interface';
import { MOVEMENT_TYPE_OPTIONS } from '../config/constant';

export const InventoryFilterToolbar: React.FC<InventoryFilterToolbarProps> = ({
  search,
  setSearch,
  movementTypeFilter,
  setMovementTypeFilter,
  showFilters,
  setShowFilters,
  hasActiveFilters,
  onClearFilters,
}) => {
  const { t } = useTranslation(['inventory', 'common']);

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
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
              showFilters || hasActiveFilters
                ? 'border-[#0F766E] dark:border-[#14B8A6] text-[#0F766E] dark:text-[#14B8A6]'
                : ''
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('actions.filter', { ns: 'common' })}</span>
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="p-3.5 bg-[#F4F8F7] dark:bg-[#162E2D] rounded-xl border border-[#D7E5E2] dark:border-[#1E3B38] grid grid-cols-1 sm:grid-cols-2 gap-3 items-end animate-in fade-in">
          <Select
            label={t('columns.movementType')}
            value={movementTypeFilter}
            onValueChange={(val) => setMovementTypeFilter(val as MovementTypeFilter)}
            options={MOVEMENT_TYPE_OPTIONS.map((opt) => ({
              value: opt.value,
              label: t(`movementTypes.${opt.value.toLowerCase()}`, { defaultValue: opt.label }),
            }))}
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
