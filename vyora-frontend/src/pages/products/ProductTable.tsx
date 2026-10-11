import React, { useState, useEffect } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency } from '../../utils';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/Table';

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  hasActiveFilters?: boolean;
  isOwner?: boolean;
  onResetFilters?: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onAddFirst: () => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  isLoading,
  hasActiveFilters,
  isOwner = true,
  onResetFilters,
  onEdit,
  onDelete,
  onAddFirst,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset to page 1 whenever list length changes (e.g. searching/filtering)
  useEffect(() => {
    setCurrentPage(1);
  }, [products.length, hasActiveFilters]);

  if (isLoading) {
    return (
      <div className="py-12 text-center text-xs text-[#566B69]">
        <div className="w-6 h-6 border-2 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading product catalog...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title={hasActiveFilters ? 'No products match filters' : 'No products found'}
        description={
          hasActiveFilters
            ? 'No catalog items match your search or filter criteria. Try clearing filters.'
            : 'Add items to your catalog to start creating invoices and tracking inventory.'
        }
        actionLabel={hasActiveFilters ? 'Reset Filters' : isOwner ? 'Add Product' : undefined}
        onAction={hasActiveFilters ? onResetFilters : isOwner ? onAddFirst : undefined}
      />
    );
  }

  const paginatedProducts = products.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[#D7E5E2] bg-white overflow-hidden shadow-sm">
        <Table className="min-w-[680px] whitespace-nowrap">
          <TableHeader>
            <TableRow>
              <TableHead>Product / Item</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>HSN</TableHead>
              <TableHead className="text-right">Selling Price</TableHead>
              <TableHead className="text-center">Tax %</TableHead>
              <TableHead className="text-center">Current Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.map((prod) => {
              const isLow = prod.currentStock <= prod.reorderLevel;
              return (
                <TableRow key={prod.id}>
                  <TableCell className="font-bold text-[#123B3A]">
                    {prod.name}
                    <span className="text-[10px] text-[#566B69] font-normal block">
                      Unit: {prod.unit}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono font-bold text-[#0F766E]">
                    {prod.sku}
                  </TableCell>
                  <TableCell className="font-mono text-[#566B69]">
                    {prod.hsnCode || '-'}
                  </TableCell>
                  <TableCell className="text-right font-bold text-[#123B3A]">
                    {formatCurrency(prod.sellingPriceMinor)}
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {prod.taxRatePercent}%
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex items-center gap-1.5">
                      <span className={`font-bold ${isLow ? 'text-[#B91C1C]' : 'text-[#123B3A]'}`}>
                        {prod.currentStock} {prod.unit}
                      </span>
                      {isLow && (
                        <Badge variant="overdue" className="text-[9px] px-1 py-0">
                          Low
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {isOwner ? (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onEdit(prod)}
                          title="Edit product"
                          className="p-1.5 rounded-lg text-[#0F766E] hover:bg-[#E6F4F2] hover:text-[#0D665F] transition-colors"
                          aria-label="Edit product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(prod)}
                          title="Delete product"
                          className="p-1.5 rounded-lg text-[#B91C1C] hover:bg-[#FEE2E2] hover:text-[#991B1B] transition-colors"
                          aria-label="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-[#566B69] italic">--</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={products.length}
        itemsPerPage={pageSize}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(limit) => {
          setPageSize(limit);
          setCurrentPage(1);
        }}
        pageSizeOptions={[10, 25, 50, 100]}
      />
    </div>
  );
};
