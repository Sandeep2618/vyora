import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatDateReadable } from '@/utils';
import { Badge } from '@/components/ui/Badge';
import { Table, ITableOption } from '@/components/Table';
import { PurchaseBill } from '@/types';
import { PurchasesTableProps } from '../config/interface';

export const PurchasesTable: React.FC<PurchasesTableProps> = ({ bills }) => {
  const { t } = useTranslation(['purchases', 'common']);

  const tableOption: ITableOption<PurchaseBill> = useMemo(
    () => ({
      module: 'purchases',
      rowKey: 'id',
      data: bills,
      search: false,
      column: [
        {
          dataIndex: 'billNumber',
          title: t('columns.billNo', { ns: 'purchases' }),
          sortable: true,
          render: (b) => (
            <span className="font-mono font-bold text-[#0F766E] dark:text-[#14B8A6]">
              {b.billNumber}
            </span>
          ),
        },
        {
          dataIndex: 'supplierSnapshot.name',
          title: t('columns.supplier', { ns: 'purchases' }),
          sortable: true,
          render: (b) => (
            <span className="font-bold text-[#123B3A] dark:text-[#F0FDFA]">
              {b.supplierSnapshot?.name || '-'}
            </span>
          ),
        },
        {
          dataIndex: 'billDate',
          title: t('columns.billDate', { ns: 'purchases' }),
          sortable: true,
          render: (b) => (
            <span className="text-[#566B69] dark:text-[#8FA8A4]">
              {formatDateReadable(b.billDate)}
            </span>
          ),
        },
        {
          dataIndex: 'items',
          title: t('columns.items', { ns: 'purchases' }),
          align: 'center',
          render: (b) => (
            <span className="font-medium text-xs text-[#566B69] dark:text-[#8FA8A4]">
              {b.items.length} items
            </span>
          ),
        },
        {
          dataIndex: 'subtotalMinor',
          title: t('columns.subtotal', { ns: 'purchases' }),
          sortable: true,
          align: 'right',
          render: (b) => (
            <span className="text-[#566B69] dark:text-[#8FA8A4]">
              {formatCurrency(b.subtotalMinor)}
            </span>
          ),
        },
        {
          dataIndex: 'totalTaxMinor',
          title: t('columns.tax', { ns: 'purchases' }),
          sortable: true,
          align: 'right',
          render: (b) => (
            <span className="text-[#566B69] dark:text-[#8FA8A4]">
              {formatCurrency(b.totalTaxMinor)}
            </span>
          ),
        },
        {
          dataIndex: 'grandTotalMinor',
          title: t('columns.total', { ns: 'purchases' }),
          sortable: true,
          align: 'right',
          render: (b) => (
            <div className="text-right font-bold text-[#123B3A] dark:text-[#F0FDFA]">
              {formatCurrency(b.grandTotalMinor)}
            </div>
          ),
        },
        {
          dataIndex: 'status',
          title: t('columns.status', { ns: 'purchases' }),
          sortable: true,
          align: 'center',
          render: (b) => (
            <Badge variant={b.status === 'RECEIVED' ? 'paid' : 'neutral'}>
              {b.status}
            </Badge>
          ),
        },
      ],
      emptyState: {
        title: 'No purchase bills recorded',
        description: 'Record incoming supplier purchase invoices and stock receipts.',
      },
      pagination: {
        defaultPageSize: 10,
        pageSizeOptions: [10, 20, 50, 100],
      },
      export: {
        filename: 'purchases-bills.csv',
      },
    }),
    [t, bills]
  );

  return <Table<PurchaseBill> option={tableOption} />;
};
