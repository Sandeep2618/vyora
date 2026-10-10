import React, { useState, useMemo } from 'react';
import { Plus, Filter, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchInput } from '../../components/ui/SearchInput';
import { useProducts, useArchiveProduct } from '../../hooks/useProducts';
import { ProductTable } from './ProductTable';
import { ProductFormModal } from './ProductFormModal';

export const ProductsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'IN_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [taxFilter, setTaxFilter] = useState<string>('ALL');
  const [unitFilter, setUnitFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useProducts({ search: '' });
  const archiveMutation = useArchiveProduct();

  // Multi-attribute responsive filtering
  const filteredProducts = useMemo(() => {
    if (!data?.items) return [];

    return data.items.filter((p) => {
      // Search
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.hsnCode && p.hsnCode.toLowerCase().includes(q));

      // Stock Status
      let matchesStock = true;
      if (stockFilter === 'LOW') {
        matchesStock = p.currentStock > 0 && p.currentStock <= p.reorderLevel;
      } else if (stockFilter === 'IN_STOCK') {
        matchesStock = p.currentStock > p.reorderLevel;
      } else if (stockFilter === 'OUT_OF_STOCK') {
        matchesStock = p.currentStock <= 0;
      }

      // Tax Slabs
      const matchesTax = taxFilter === 'ALL' || String(p.taxRatePercent) === taxFilter;

      // Unit
      const matchesUnit = unitFilter === 'ALL' || p.unit === unitFilter;

      return matchesSearch && matchesStock && matchesTax && matchesUnit;
    });
  }, [data?.items, search, stockFilter, taxFilter, unitFilter]);

  const hasActiveFilters = stockFilter !== 'ALL' || taxFilter !== 'ALL' || unitFilter !== 'ALL' || search !== '';

  const clearAllFilters = () => {
    setSearch('');
    setStockFilter('ALL');
    setTaxFilter('ALL');
    setUnitFilter('ALL');
  };

  return (
    <div className="space-y-4 sm:space-y-5 max-w-7xl mx-auto">
      <PageHeader
        title="Products & Services"
        description="Manage your inventory items, prices in minor precision, and GST tax brackets"
      >
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 w-full sm:w-auto justify-center">
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </Button>
      </PageHeader>

      <Card className="p-3.5 sm:p-5 space-y-4">
        {/* Search & Filter Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                showFilters || stockFilter !== 'ALL' || taxFilter !== 'ALL' || unitFilter !== 'ALL'
                  ? 'bg-[#E6F4F2] border-[#0F766E] text-[#0F766E]'
                  : 'bg-[#F4F8F7] border-[#D7E5E2] text-[#566B69] hover:text-[#123B3A]'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {(stockFilter !== 'ALL' || taxFilter !== 'ALL' || unitFilter !== 'ALL') && (
                <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
              )}
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-2.5 py-1.5 text-xs font-medium text-[#B91C1C] hover:bg-[#FEF2F2] rounded-lg transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}

            <span className="text-xs text-[#566B69] ml-1">
              Showing <span className="font-bold text-[#123B3A]">{filteredProducts.length}</span> of {data?.items?.length || 0}
            </span>
          </div>

          {/* Search bar: full width on mobile/tablet, right aligned on desktop */}
          <div className="w-full lg:w-72 shrink-0">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search product name, SKU, HSN..."
            />
          </div>
        </div>

        {/* Expandable Filter Panel */}
        {showFilters && (
          <div className="p-3.5 bg-[#F4F8F7] border border-[#D7E5E2] rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in">
            {/* Stock Level Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-[#123B3A] mb-1">
                Stock Status
              </label>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D7E5E2] rounded-lg text-[#123B3A] focus:outline-none focus:border-[#0F766E]"
              >
                <option value="ALL">All Stock Levels</option>
                <option value="LOW">⚠️ Low Stock Alerts (≤ Reorder)</option>
                <option value="IN_STOCK">✅ Healthy Stock</option>
                <option value="OUT_OF_STOCK">❌ Out of Stock (0)</option>
              </select>
            </div>

            {/* GST Tax Slabs */}
            <div>
              <label className="block text-[11px] font-semibold text-[#123B3A] mb-1">
                GST Tax Slab
              </label>
              <select
                value={taxFilter}
                onChange={(e) => setTaxFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D7E5E2] rounded-lg text-[#123B3A] focus:outline-none focus:border-[#0F766E]"
              >
                <option value="ALL">All Tax Slabs</option>
                <option value="0">0% (Exempt)</option>
                <option value="5">5% GST</option>
                <option value="12">12% GST</option>
                <option value="18">18% GST (Standard)</option>
                <option value="28">28% GST</option>
              </select>
            </div>

            {/* Unit Measure */}
            <div>
              <label className="block text-[11px] font-semibold text-[#123B3A] mb-1">
                Measurement Unit
              </label>
              <select
                value={unitFilter}
                onChange={(e) => setUnitFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D7E5E2] rounded-lg text-[#123B3A] focus:outline-none focus:border-[#0F766E]"
              >
                <option value="ALL">All Units</option>
                <option value="PCS">PCS (Pieces)</option>
                <option value="BOX">BOX (Boxes)</option>
                <option value="KG">KG (Kilograms)</option>
                <option value="LTR">LTR (Liters)</option>
                <option value="MTR">MTR (Meters)</option>
                <option value="SET">SET (Sets)</option>
                <option value="PKT">PKT (Packets)</option>
              </select>
            </div>
          </div>
        )}

        {/* Product Table */}
        <ProductTable
          products={filteredProducts}
          isLoading={isLoading}
          onArchive={(id) => archiveMutation.mutate(id)}
          onAddFirst={() => setIsModalOpen(true)}
        />
      </Card>

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
