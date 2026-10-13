import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { useInventoryMovements } from '../../hooks/useInventory';
import { MovementTypeFilter } from './config';
import { InventoryFilterToolbar } from './components/InventoryFilterToolbar';
import { StockMovementTable } from './components/StockMovementTable';
import { StockAdjustmentModal } from './components/StockAdjustmentModal';

export const InventoryPage: React.FC = () => {
  const { isOwner, hasFeature } = useAuth();
  const { t } = useTranslation(['inventory', 'common']);
  const canAdjust = isOwner && hasFeature('STOCK_ADJUSTMENTS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [movementTypeFilter, setMovementTypeFilter] = useState<MovementTypeFilter>('ALL');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useInventoryMovements();

  // Multi-attribute filter
  const filteredMovements = useMemo(() => {
    if (!data?.items) return [];

    return data.items.filter((m) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.productName.toLowerCase().includes(q) ||
        m.sku.toLowerCase().includes(q) ||
        (m.reason && m.reason.toLowerCase().includes(q));

      let matchesType = true;
      if (movementTypeFilter === 'SALE') {
        matchesType = m.movementType === 'SALE';
      } else if (movementTypeFilter === 'PURCHASE') {
        matchesType = m.movementType === 'PURCHASE';
      } else if (movementTypeFilter === 'ADJUSTMENT') {
        matchesType = m.movementType === 'ADJUSTMENT_IN' || m.movementType === 'ADJUSTMENT_OUT';
      } else if (movementTypeFilter === 'CANCEL') {
        matchesType = m.movementType === 'SALE_CANCEL' || m.movementType === 'PURCHASE_CANCEL';
      } else if (movementTypeFilter === 'OPENING') {
        matchesType = m.movementType === 'OPENING';
      }

      return matchesSearch && matchesType;
    });
  }, [data?.items, search, movementTypeFilter]);

  const hasActiveFilters = movementTypeFilter !== 'ALL' || search !== '';

  const clearAllFilters = () => {
    setMovementTypeFilter('ALL');
    setSearch('');
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
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

      <Card className="p-3.5 sm:p-5 space-y-4">
        <InventoryFilterToolbar
          search={search}
          setSearch={setSearch}
          movementTypeFilter={movementTypeFilter}
          setMovementTypeFilter={setMovementTypeFilter}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearAllFilters}
        />

        <StockMovementTable
          movements={filteredMovements}
          isLoading={isLoading}
          canAdjust={canAdjust}
          onOpenAdjustment={() => setIsModalOpen(true)}
        />
      </Card>

      <StockAdjustmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
