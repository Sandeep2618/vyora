import React, { useState, useMemo } from 'react';
import { Plus, Filter, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchInput } from '../../components/ui/SearchInput';
import { Select } from '../../components/ui/Select';
import { useAuth } from '../../context/AuthContext';
import { useProducts, useDeleteProduct } from '../../hooks/useProducts';
import { Product } from '../../types';
import { ProductTable } from './ProductTable';
import { ProductFormModal } from './ProductFormModal';

export const ProductsPage: React.FC = () => {
  const { isOwner } = useAuth();
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'IN_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [taxFilter, setTaxFilter] = useState<string>('ALL');
  const [unitFilter, setUnitFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useProducts({ search: '' });
  const deleteMutation = useDeleteProduct();

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
        {isOwner && (
          <Button
            onClick={() => {
              setProductToEdit(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Button>
        )}
      </PageHeader>

      <Card className="p-3.5 sm:p-5 space-y-4">
        {/* Search & Filter Controls Bar: Only displayed when catalog has items or active filters */}
        {Boolean((data?.items && data.items.length > 0) || hasActiveFilters) && (
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
        )}

        {/* Expandable Filter Panel */}
        {showFilters && (
          <div className="p-3.5 bg-[#F4F8F7] border border-[#D7E5E2] rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in">
            {/* Stock Level Filter */}
            <Select
              label="Stock Status"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              options={[
                { label: 'All Stock Levels', value: 'ALL' },
                { label: '⚠️ Low Stock Alerts (≤ Reorder)', value: 'LOW' },
                { label: '✅ Healthy Stock', value: 'IN_STOCK' },
                { label: '❌ Out of Stock (0)', value: 'OUT_OF_STOCK' },
              ]}
            />

            {/* GST Tax Slabs */}
            <Select
              label="GST Tax Slab"
              value={taxFilter}
              onChange={(e) => setTaxFilter(e.target.value)}
              options={[
                { label: 'All Tax Slabs', value: 'ALL' },
                { label: '0% (Exempt)', value: '0' },
                { label: '5% GST', value: '5' },
                { label: '12% GST', value: '12' },
                { label: '18% GST (Standard)', value: '18' },
                { label: '28% GST', value: '28' },
              ]}
            />

            {/* Unit Measure */}
            <Select
              label="Measurement Unit"
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              options={[
                { label: 'All Units', value: 'ALL' },
                { label: 'PCS (Pieces)', value: 'PCS' },
                { label: 'BOX (Boxes)', value: 'BOX' },
                { label: 'KG (Kilograms)', value: 'KG' },
                { label: 'LTR (Liters)', value: 'LTR' },
                { label: 'MTR (Meters)', value: 'MTR' },
                { label: 'SET (Sets)', value: 'SET' },
                { label: 'PKT (Packets)', value: 'PKT' },
              ]}
            />
          </div>
        )}

        {/* Product Table */}
        <ProductTable
          products={filteredProducts}
          isLoading={isLoading}
          hasActiveFilters={hasActiveFilters}
          isOwner={isOwner}
          onResetFilters={clearAllFilters}
          onEdit={(prod) => {
            setProductToEdit(prod);
            setIsModalOpen(true);
          }}
          onDelete={(prod) => {
            setProductToDelete(prod);
          }}
          onAddFirst={() => {
            setProductToEdit(null);
            setIsModalOpen(true);
          }}
        />
      </Card>

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
      />

      {/* Modal: Delete Product Confirmation */}
      <Modal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        title="Delete Product"
        description="Confirm product removal from your active inventory"
        maxWidth="sm"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setProductToDelete(null)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              isLoading={deleteMutation.isPending}
              onClick={async () => {
                if (productToDelete) {
                  await deleteMutation.mutateAsync(productToDelete.id);
                  setProductToDelete(null);
                }
              }}
              className="w-full sm:w-auto"
            >
              Delete Product
            </Button>
          </>
        }
      >
        <p className="text-xs sm:text-sm text-[#566B69] leading-relaxed">
          Are you sure you want to delete <strong className="text-[#123B3A]">{productToDelete?.name}</strong> ({productToDelete?.sku})? This will remove the item from your active inventory and catalog.
        </p>
      </Modal>
    </div>
  );
};
