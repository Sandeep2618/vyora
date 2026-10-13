import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { useProducts, useDeleteProduct } from '../../hooks/useProducts';
import { Product } from '../../types';
import { StockFilter } from './config';
import { ProductFilterToolbar } from './components/ProductFilterToolbar';
import { ProductTable } from './components/ProductTable';
import { ProductFormModal } from './components/ProductFormModal';
import { DeleteProductModal } from './components/DeleteProductModal';

export const ProductsPage: React.FC = () => {
  const { isOwner } = useAuth();
  const { t } = useTranslation(['products', 'common']);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('ALL');
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
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.hsnCode && p.hsnCode.toLowerCase().includes(q));

      let matchesStock = true;
      if (stockFilter === 'LOW') {
        matchesStock = p.currentStock > 0 && p.currentStock <= p.reorderLevel;
      } else if (stockFilter === 'IN_STOCK') {
        matchesStock = p.currentStock > p.reorderLevel;
      } else if (stockFilter === 'OUT_OF_STOCK') {
        matchesStock = p.currentStock <= 0;
      }

      const matchesTax = taxFilter === 'ALL' || String(p.taxRatePercent) === taxFilter;
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
        title={t('title')}
        description={t('subtitle')}
      >
        {isOwner && (
          <Button
            onClick={() => {
              setProductToEdit(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 w-full sm:w-auto justify-center shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{t('actions.addProduct', { ns: 'common' })}</span>
          </Button>
        )}
      </PageHeader>

      <Card className="p-3.5 sm:p-5 space-y-4">
        {Boolean((data?.items && data.items.length > 0) || hasActiveFilters) && (
          <ProductFilterToolbar
            search={search}
            setSearch={setSearch}
            stockFilter={stockFilter}
            setStockFilter={setStockFilter}
            taxFilter={taxFilter}
            setTaxFilter={setTaxFilter}
            unitFilter={unitFilter}
            setUnitFilter={setUnitFilter}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearAllFilters}
          />
        )}

        <ProductTable
          products={filteredProducts}
          isLoading={isLoading}
          hasActiveFilters={hasActiveFilters}
          isOwner={isOwner}
          onResetFilters={clearAllFilters}
          onEdit={(p) => {
            setProductToEdit(p);
            setIsModalOpen(true);
          }}
          onDelete={(p) => setProductToDelete(p)}
          onAddFirst={() => {
            setProductToEdit(null);
            setIsModalOpen(true);
          }}
        />
      </Card>

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
      />

      {/* Delete Product Modal */}
      <DeleteProductModal
        product={productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={() => {
          if (productToDelete) {
            deleteMutation.mutate(productToDelete.id, {
              onSuccess: () => setProductToDelete(null),
            });
          }
        }}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
