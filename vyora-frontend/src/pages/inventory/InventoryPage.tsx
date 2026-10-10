import React, { useState, useMemo } from 'react';
import { Plus, Filter, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchInput } from '../../components/ui/SearchInput';
import { useInventoryMovements } from '../../hooks/useInventory';
import { StockMovementTable } from './StockMovementTable';
import { StockAdjustmentModal } from './StockAdjustmentModal';

export const InventoryPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [movementTypeFilter, setMovementTypeFilter] = useState<string>('ALL');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useInventoryMovements();

  // Multi-attribute filter
  const filteredMovements = useMemo(() => {
    if (!data?.items) return [];

    return data.items.filter((m) => {
      // Search
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.productName.toLowerCase().includes(q) ||
        m.sku.toLowerCase().includes(q) ||
        (m.reason && m.reason.toLowerCase().includes(q));

      // Movement Type
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
        title="Inventory Movements"
        description="Traceable stock movement history across sales, purchases, and audited manual adjustments"
      >
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          <span>Record Stock Adjustment</span>
        </Button>
      </PageHeader>

      <Card className="p-3.5 sm:p-5 space-y-4">
        {/* Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                showFilters || movementTypeFilter !== 'ALL'
                  ? 'bg-[#E6F4F2] border-[#0F766E] text-[#0F766E]'
                  : 'bg-[#F4F8F7] border-[#D7E5E2] text-[#566B69] hover:text-[#123B3A]'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Movement Type</span>
              {movementTypeFilter !== 'ALL' && <span className="w-2 h-2 rounded-full bg-[#0F766E]" />}
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-2.5 py-1.5 text-xs font-medium text-[#B91C1C] hover:bg-[#FEF2F2] rounded-lg transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}

            <div className="text-xs text-[#566B69] font-medium hidden sm:block">
              Showing <span className="font-bold text-[#123B3A]">{filteredMovements.length}</span> logs
            </div>
          </div>

          <div className="w-full lg:w-72 shrink-0">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search product name, SKU..."
              className="w-full"
            />
          </div>
        </div>

        {/* Filter Drawer */}
        {showFilters && (
          <div className="p-3.5 bg-[#F4F8F7] border border-[#D7E5E2] rounded-xl flex items-center gap-3 animate-in fade-in flex-wrap">
            <span className="text-xs font-bold text-[#123B3A]">Filter By Type:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { label: 'All Movements', val: 'ALL' },
                { label: 'Sales Outward', val: 'SALE' },
                { label: 'Purchases Inward', val: 'PURCHASE' },
                { label: 'Manual Adjustments', val: 'ADJUSTMENT' },
                { label: 'Opening Stock', val: 'OPENING' },
                { label: 'Cancellations', val: 'CANCEL' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setMovementTypeFilter(opt.val)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    movementTypeFilter === opt.val
                      ? 'bg-[#0F766E] text-white shadow-2xs font-semibold'
                      : 'bg-white border border-[#D7E5E2] text-[#566B69] hover:text-[#123B3A]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <StockMovementTable
          movements={filteredMovements}
          isLoading={isLoading}
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
