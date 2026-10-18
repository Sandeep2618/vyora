import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@vyora/utils';
import { Table, ITableOption } from '@/components/Table';
import { CustomerDuesTabProps } from '../config/interface';

export const CustomerDuesTab: React.FC<CustomerDuesTabProps> = ({ duesData }) => {
  const { t } = useTranslation(['reports']);

  const tableOption: ITableOption<any> = useMemo(
    () => ({
      module: 'reports-dues',
      rowKey: 'id',
      data: duesData?.items || [],
      search: {
        placeholder: 'Search customer receivables...',
      },
      column: [
        {
          dataIndex: 'name',
          title: t('columns.customerName'),
          sortable: true,
          render: (c) => (
            <span className="font-semibold text-[#123B3A] dark:text-[#F0FDFA]">
              {c.name}
            </span>
          ),
        },
        {
          dataIndex: 'phone',
          title: t('columns.phone'),
          sortable: true,
          render: (c) => (
            <span className="text-[#566B69] dark:text-[#8FA8A4]">
              {c.phone || '—'}
            </span>
          ),
        },
        {
          dataIndex: 'dueMinor',
          title: t('columns.outstandingDue'),
          sortable: true,
          align: 'right',
          render: (c) => (
            <div className="text-right font-black text-[#B91C1C] dark:text-rose-400">
              {formatCurrency(c.dueMinor)}
            </div>
          ),
        },
      ],
      emptyState: {
        title: t('empty.duesTitle'),
        description: t('empty.duesDesc'),
      },
      pagination: {
        defaultPageSize: 10,
        pageSizeOptions: [10, 20, 50, 100],
      },
      export: {
        filename: 'customer-dues.csv',
      },
    }),
    [duesData, t]
  );

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-2xl p-4 sm:p-5 shadow-xs">
        <span className="text-xs text-[#566B69] dark:text-[#8FA8A4] font-medium">{t('summary.totalOutstanding')}</span>
        <h3 className="text-2xl font-black text-[#B91C1C] dark:text-rose-400 mt-1">
          {formatCurrency(duesData?.summary?.totalDueMinor || 0)}
        </h3>
      </div>

      <Table<any> option={tableOption} />
    </div>
  );
};
