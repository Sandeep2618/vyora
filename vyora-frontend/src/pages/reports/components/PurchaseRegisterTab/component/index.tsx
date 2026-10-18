import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatDateReadable } from '@vyora/utils';
import { Table, ITableOption } from '@/components/Table';
import { PurchaseRegisterTabProps } from '../config/interface';

export const PurchaseRegisterTab: React.FC<PurchaseRegisterTabProps> = ({ purchaseData }) => {
  const { t } = useTranslation(['reports']);

  const tableOption: ITableOption<any> = useMemo(
    () => ({
      module: 'reports-purchases',
      rowKey: 'id',
      data: purchaseData?.items || [],
      search: {
        placeholder: 'Search purchase bills...',
      },
      column: [
        {
          dataIndex: 'billDate',
          title: t('columns.date'),
          sortable: true,
          render: (p) => (
            <span className="text-[#566B69] dark:text-[#8FA8A4] whitespace-nowrap">
              {formatDateReadable(p.billDate)}
            </span>
          ),
        },
        {
          dataIndex: 'billNumber',
          title: t('columns.billNo'),
          sortable: true,
          render: (p) => (
            <span className="font-mono font-bold text-[#0F766E] dark:text-[#14B8A6]">
              {p.billNumber}
            </span>
          ),
        },
        {
          dataIndex: 'supplierName',
          title: t('columns.supplier'),
          sortable: true,
          render: (p) => (
            <span className="font-semibold text-[#123B3A] dark:text-[#F0FDFA]">
              {p.supplierName}
            </span>
          ),
        },
        {
          dataIndex: 'subtotalMinor',
          title: t('columns.subtotal'),
          sortable: true,
          align: 'right',
          render: (p) => (
            <div className="text-right font-medium text-[#123B3A] dark:text-[#F0FDFA]">
              {formatCurrency(p.subtotalMinor)}
            </div>
          ),
        },
        {
          dataIndex: 'totalTaxMinor',
          title: t('columns.taxes'),
          sortable: true,
          align: 'right',
          render: (p) => (
            <div className="text-right text-[#566B69] dark:text-[#8FA8A4]">
              {formatCurrency(p.totalTaxMinor)}
            </div>
          ),
        },
        {
          dataIndex: 'grandTotalMinor',
          title: t('columns.totalAmount'),
          sortable: true,
          align: 'right',
          render: (p) => (
            <div className="text-right font-bold text-[#123B3A] dark:text-[#F0FDFA]">
              {formatCurrency(p.grandTotalMinor)}
            </div>
          ),
        },
      ],
      emptyState: {
        title: t('empty.purchasesTitle'),
        description: t('empty.purchasesDesc'),
      },
      pagination: {
        defaultPageSize: 10,
        pageSizeOptions: [10, 20, 50, 100],
      },
      export: {
        filename: 'purchase-register.csv',
      },
    }),
    [purchaseData, t]
  );

  return (
    <div className="space-y-4">
      <Table<any> option={tableOption} />
    </div>
  );
};
