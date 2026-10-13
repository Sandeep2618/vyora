import React, { useState, useEffect } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/utils';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { ProductTableProps } from '../config/interface';
import { DEFAULT_PAGE_SIZE } from '../config/constant';
import { checkProductStockStatus } from '../util';

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
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const { t } = useTranslation(['products', 'common']);

  // Reset to page 1 whenever list length changes
  useEffect(() => {
    setCurrentPage(1);
  }, [products.length, hasActiveFilters]);

  if (isLoading) {
    return (
      <div className="py-12 text-center text-xs text-[#566B69] dark:text-[#8FA8A4]">
        <div className="w-6 h-6 border-2 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        {t('status.loading', { ns: 'common' })}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title={hasActiveFilters ? 'No products match filters' : t('empty.title')}
        description={
          hasActiveFilters
            ? 'No product records match your active search, stock, or tax slab filters. Reset filters to view all.'
            : t('empty.description')
        }
        actionLabel={hasActiveFilters ? t('actions.reset', { ns: 'common' }) : isOwner ? t('actions.addProduct', { ns: 'common' }) : undefined}
        onAction={hasActiveFilters ? onResetFilters : isOwner ? onAddFirst : undefined}
      />
    );
  }

  const paginatedProducts = products.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[#D7E5E2] dark:border-[#1E3B38] bg-white dark:bg-[#112322] overflow-hidden shadow-2xs">
        <Table className="min-w-[680px] whitespace-nowrap">
          <TableHeader>
            <TableRow>
              <TableHead>{t('columns.name')}</TableHead>
              <TableHead>{t('columns.sku')}</TableHead>
              <TableHead className="text-right">{t('columns.price')}</TableHead>
              <TableHead className="text-center">{t('columns.stock')}</TableHead>
              <TableHead className="text-center">{t('columns.gst')}</TableHead>
              <TableHead className="text-right">{t('columns.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.map((p) => {
              const { isLowStock, isOutOfStock } = checkProductStockStatus(p.currentStock, p.reorderLevel);

              return (
                <TableRow key={p.id}>
                  <TableCell className="font-bold text-[#123B3A] dark:text-[#F0FDFA]">
                    {p.name}
                    {p.hsnCode && (
                      <p className="text-[10px] text-[#566B69] dark:text-[#8FA8A4] font-mono font-normal">
                        HSN: {p.hsnCode}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[#566B69] dark:text-[#8FA8A4]">
                    {p.sku}
                  </TableCell>
                  <TableCell className="text-right font-bold text-[#123B3A] dark:text-[#F0FDFA]">
                    {formatCurrency(p.sellingPriceMinor)}
                    {p.purchasePriceMinor && (
                      <p className="text-[10px] text-[#566B69] dark:text-[#8FA8A4] font-normal">
                        Cost: {formatCurrency(p.purchasePriceMinor)}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="font-semibold text-xs text-[#123B3A] dark:text-[#F0FDFA]">
                        {p.currentStock} {p.unit}
                      </span>
                      {isOutOfStock ? (
                        <Badge variant="overdue">{t('badge.out')}</Badge>
                      ) : isLowStock ? (
                        <Badge variant="pending">{t('badge.low')}</Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#E6F4F2] dark:bg-[#162E2D] text-[#0F766E] dark:text-[#14B8A6]">
                      {p.taxRatePercent}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {isOwner && (
                        <>
                          <button
                            onClick={() => onEdit(p)}
                            title="Edit"
                            className="p-1.5 text-[#566B69] dark:text-[#8FA8A4] hover:text-[#0F766E] dark:hover:text-[#14B8A6] hover:bg-[#E6F4F2] dark:hover:bg-[#162E2D] rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(p)}
                            title="Delete"
                            className="p-1.5 text-[#566B69] dark:text-[#8FA8A4] hover:text-[#B91C1C] dark:hover:text-rose-400 hover:bg-[#FEE2E2] dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
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
        onItemsPerPageChange={setPageSize}
      />
    </div>
  );
};
