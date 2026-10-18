import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/Badge';
import { Table, ITableOption } from '@/components/Table';
import { MovementItem } from '@/pages/inventory/config';
import { StockMovementTableProps } from '../config/interface';
import { getMovementBadgeVariant } from '../util';

export const StockMovementTable: React.FC<StockMovementTableProps> = ({
  movements,
  isLoading,
  canAdjust = true,
  onOpenAdjustment,
  headerActions,
}) => {
  const { t } = useTranslation(['inventory', 'common']);

  const tableOption: ITableOption<MovementItem> = useMemo(
    () => ({
      module: 'inventory',
      rowKey: 'id',
      data: movements,
      headerActions,
      countPill: true,
      search: {
        placeholder: t('actions.search', { ns: 'common', defaultValue: 'Search product, SKU, reason...' }),
      },
      column: [
        {
          dataIndex: 'createdAt',
          title: t('columns.dateTime'),
          sortable: true,
          render: (m) => (
            <span className="text-[#566B69] dark:text-[#8FA8A4]">
              {new Date(m.createdAt).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          ),
        },
        {
          dataIndex: 'productName',
          title: t('columns.productName'),
          sortable: true,
          render: (m) => (
            <span className="font-bold text-[#123B3A] dark:text-[#F0FDFA]">
              {m.productName}
            </span>
          ),
        },
        {
          dataIndex: 'sku',
          title: t('columns.sku'),
          sortable: true,
          render: (m) => (
            <span className="font-mono font-semibold text-[#0F766E] dark:text-[#14B8A6]">
              {m.sku}
            </span>
          ),
        },
        {
          dataIndex: 'movementType',
          title: t('columns.movementType'),
          sortable: true,
          align: 'center',
          render: (m) => (
            <span className="font-semibold text-[#123B3A] dark:text-[#F0FDFA] text-[11px]">
              {m.movementType}
            </span>
          ),
        },
        {
          dataIndex: 'quantityDelta',
          title: t('columns.change'),
          align: 'center',
          render: (m) => {
            const { variant, text } = getMovementBadgeVariant(
              m.movementType,
              m.quantityDelta
            );
            return <Badge variant={variant}>{text}</Badge>;
          },
        },
        {
          dataIndex: 'resultingStock',
          title: t('columns.resultingStock'),
          sortable: true,
          align: 'center',
          render: (m) => (
            <span className="font-bold text-[#123B3A] dark:text-[#F0FDFA]">
              {m.resultingStock} {m.unit}
            </span>
          ),
        },
        {
          dataIndex: 'reason',
          title: t('columns.reason'),
          render: (m) => (
            <span className="text-[#566B69] dark:text-[#8FA8A4] italic max-w-xs truncate">
              {m.reason || m.referenceType || '-'}
            </span>
          ),
        },
      ],
      emptyState: {
        title: t('empty.title'),
        description: t('empty.description'),
        actionLabel: canAdjust ? t('empty.action') : undefined,
        onAction: canAdjust ? onOpenAdjustment : undefined,
      },
      pagination: {
        defaultPageSize: 10,
        pageSizeOptions: [10, 20, 50, 100],
      },
      export: {
        filename: 'stock-movements.csv',
      },
    }),
    [t, canAdjust, onOpenAdjustment, movements]
  );

  if (isLoading) {
    return (
      <div className="py-12 text-center text-xs text-[#566B69] dark:text-[#8FA8A4]">
        <div className="w-6 h-6 border-2 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        {t('status.loading', { ns: 'common' })}
      </div>
    );
  }

  return <Table<MovementItem> option={tableOption} />;
};
