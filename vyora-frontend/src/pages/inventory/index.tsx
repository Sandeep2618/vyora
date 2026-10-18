import React, { useState, useMemo } from 'react';
import { Plus, Filter, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Select } from '@/components/ui/Select';
import { useAuth } from '@/context/AuthContext';
import { useInventoryMovements } from '@/hooks/useInventory';
import { MovementTypeFilter } from './config';
import { MOVEMENT_TYPE_OPTIONS } from './components/InventoryFilterToolbar/config/constant';
import { StockMovementTable } from './components/StockMovementTable';
import { StockAdjustmentModal } from './modal/StockAdjustmentModal';

export const InventoryPage: React.FC = () => {
  const { isOwner, hasFeature } = useAuth();
  const { t } = useTranslation(['inventory', 'common']);
  const canAdjust = isOwner && hasFeature('STOCK_ADJUSTMENTS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [movementTypeFilter, setMovementTypeFilter] = useState<MovementTypeFilter>('ALL');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useInventoryMovements();

  // Multi-attribute filter (search is handled automatically by Table)
  const filteredMovements = useMemo(() => {
    if (!data?.items) return [];

    return data.items.filter((m) => {
      if (movementTypeFilter === 'SALE') {
        return m.movementType === 'SALE';
      } else if (movementTypeFilter === 'PURCHASE') {
        return m.movementType === 'PURCHASE';
      } else if (movementTypeFilter === 'ADJUSTMENT') {
        return m.movementType === 'ADJUSTMENT_IN' || m.movementType === 'ADJUSTMENT_OUT';
      } else if (movementTypeFilter === 'CANCEL') {
        return m.movementType === 'SALE_CANCEL' || m.movementType === 'PURCHASE_CANCEL';
      } else if (movementTypeFilter === 'OPENING') {
        return m.movementType === 'OPENING';
      }
      return true;
    });
  }, [data?.items, movementTypeFilter]);

  const hasActiveFilters = movementTypeFilter !== 'ALL';

  const clearAllFilters = () => {
    setMovementTypeFilter('ALL');
  };

  const headerActions = (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => setShowFilters((prev) => !prev)}
        className={`h-8.5 px-2.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 cursor-pointer ${
          showFilters || hasActiveFilters
            ? 'bg-[#E6F4F2] dark:bg-[#162E2D] border-[#0F766E] text-[#0F766E] dark:text-[#14B8A6]'
            : 'bg-white dark:bg-[#112322] border-[#D7E5E2] dark:border-[#1E3B38] text-[#566B69] dark:text-[#8FA8A4] hover:text-[#123B3A] dark:hover:text-[#F0FDFA]'
        }`}
        title={t('actions.filter', { ns: 'common' })}
      >
        <Filter className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{t('actions.filter', { ns: 'common' })}</span>
        {hasActiveFilters && (
          <span className="w-2 h-2 rounded-full bg-[#0F766E] dark:bg-[#14B8A6]" />
        )}
      </button>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearAllFilters}
          className="h-8.5 px-2.5 text-xs font-medium text-[#B91C1C] dark:text-rose-400 hover:bg-[#FEF2F2] dark:hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          title={t('actions.reset', { ns: 'common' })}
        >
          <X className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('actions.reset', { ns: 'common' })}</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
      >
        {canAdjust && (
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 w-full sm:w-auto shadow-sm">
            <Plus className="w-4 h-4" />
            <span>{t('button.recordAdjustment')}</span>
          </Button>
        )}
      </PageHeader>

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
        </div>
      )}

      <StockMovementTable
        movements={filteredMovements}
        isLoading={isLoading}
        canAdjust={canAdjust}
        onOpenAdjustment={() => setIsModalOpen(true)}
        headerActions={headerActions}
      />

      <StockAdjustmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default InventoryPage;
