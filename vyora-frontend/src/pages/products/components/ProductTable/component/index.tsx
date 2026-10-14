import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/utils';
import { Badge } from '@/components/ui/Badge';
import { Table, ITableOption, ITableEvent, TABLE_EVENT } from '@/components/Table';
import { Product } from '@/types';
import { ProductTableProps } from '../config/interface';
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
  const { t } = useTranslation(['products', 'common']);

  const tableOption: ITableOption<Product> = useMemo(
    () => ({
      module: 'products',
      rowKey: 'id',
      data: products,
      search: false,
      isFiltered: hasActiveFilters,
      column: [
        {
          dataIndex: 'name',
          title: t('columns.name'),
          sortable: true,
          render: (p) => (
            <div className="font-bold text-[#123B3A] dark:text-[#F0FDFA]">
              {p.name}
              {p.hsnCode && (
                <p className="text-[10px] text-[#566B69] dark:text-[#8FA8A4] font-mono font-normal">
                  HSN: {p.hsnCode}
                </p>
              )}
            </div>
          ),
        },
        {
          dataIndex: 'sku',
          title: t('columns.sku'),
          sortable: true,
          render: (p) => (
            <span className="font-mono text-xs text-[#566B69] dark:text-[#8FA8A4]">
              {p.sku}
            </span>
          ),
        },
        {
          dataIndex: 'sellingPriceMinor',
          title: t('columns.price'),
          sortable: true,
          align: 'right',
          render: (p) => (
            <div className="text-right font-bold text-[#123B3A] dark:text-[#F0FDFA]">
              {formatCurrency(p.sellingPriceMinor)}
              {p.purchasePriceMinor && (
                <p className="text-[10px] text-[#566B69] dark:text-[#8FA8A4] font-normal">
                  Cost: {formatCurrency(p.purchasePriceMinor)}
                </p>
              )}
            </div>
          ),
        },
        {
          dataIndex: 'currentStock',
          title: t('columns.stock'),
          sortable: true,
          align: 'center',
          render: (p) => {
            const { isLowStock, isOutOfStock } = checkProductStockStatus(
              p.currentStock,
              p.reorderLevel
            );
            return (
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
            );
          },
        },
        {
          dataIndex: 'taxRatePercent',
          title: t('columns.gst'),
          sortable: true,
          align: 'center',
          render: (p) => (
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#E6F4F2] dark:bg-[#162E2D] text-[#0F766E] dark:text-[#14B8A6]">
              {p.taxRatePercent}%
            </span>
          ),
        },
        {
          dataIndex: 'action',
          title: t('columns.actions'),
          align: 'right',
          action: {
            edit: isOwner,
            delete: isOwner,
          },
        },
      ],
      emptyState: {
        title: t('empty.title'),
        description: t('empty.description'),
        actionLabel: isOwner ? t('actions.addProduct', { ns: 'common' }) : undefined,
        onAction: onAddFirst,
      },
      filteredEmptyState: {
        title: 'No products match filters',
        description:
          'No product records match your active search, stock, or tax slab filters. Reset filters to view all.',
        actionLabel: t('actions.reset', { ns: 'common' }),
        onAction: onResetFilters,
      },
      pagination: {
        defaultPageSize: 10,
        pageSizeOptions: [10, 20, 50, 100],
      },
      export: {
        filename: 'products-catalog.csv',
      },
    }),
    [t, isOwner, onAddFirst, onResetFilters, products]
  );

  const handleTableEvent = (event: ITableEvent<Product>) => {
    if (event.type === TABLE_EVENT.ACTION_TRIGGER) {
      if (event.data.actionId === 'edit' && event.data.row) {
        onEdit(event.data.row);
      } else if (event.data.actionId === 'delete' && event.data.row) {
        onDelete(event.data.row);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center text-xs text-[#566B69] dark:text-[#8FA8A4]">
        <div className="w-6 h-6 border-2 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        {t('status.loading', { ns: 'common' })}
      </div>
    );
  }

  return (
    <Table<Product>
      option={tableOption}
      callBack={handleTableEvent}
    />
  );
};
