import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatDateReadable } from '@vyora/utils';
import { Table, ITableOption } from '@/components/Table';
import { SalesRegisterTabProps } from '../config/interface';

export const SalesRegisterTab: React.FC<SalesRegisterTabProps> = ({ salesData }) => {
  const { t } = useTranslation(['reports']);

  const tableOption: ITableOption<any> = useMemo(
    () => ({
      module: 'reports-sales',
      rowKey: 'id',
      data: salesData?.items || [],
      search: {
        placeholder: 'Search sales invoices...',
      },
      column: [
        {
          dataIndex: 'issueDate',
          title: t('columns.date'),
          sortable: true,
          render: (inv) => (
            <span className="text-[#566B69] dark:text-[#8FA8A4] whitespace-nowrap">
              {formatDateReadable(inv.issueDate)}
            </span>
          ),
        },
        {
          dataIndex: 'invoiceNumber',
          title: t('columns.invoiceNo'),
          sortable: true,
          render: (inv) => (
            <span className="font-mono font-bold text-[#0F766E] dark:text-[#14B8A6]">
              {inv.invoiceNumber}
            </span>
          ),
        },
        {
          dataIndex: 'customerName',
          title: t('columns.customer'),
          sortable: true,
          render: (inv) => (
            <span className="font-semibold text-[#123B3A] dark:text-[#F0FDFA]">
              {inv.customerName}
            </span>
          ),
        },
        {
          dataIndex: 'taxableMinor',
          title: t('columns.taxable'),
          sortable: true,
          align: 'right',
          render: (inv) => (
            <div className="text-right font-medium text-[#123B3A] dark:text-[#F0FDFA]">
              {formatCurrency(inv.taxableMinor)}
            </div>
          ),
        },
        {
          dataIndex: 'cgstMinor',
          title: t('columns.cgst'),
          sortable: true,
          align: 'right',
          render: (inv) => (
            <div className="text-right text-[#566B69] dark:text-[#8FA8A4]">
              {formatCurrency(inv.cgstMinor)}
            </div>
          ),
        },
        {
          dataIndex: 'sgstMinor',
          title: t('columns.sgst'),
          sortable: true,
          align: 'right',
          render: (inv) => (
            <div className="text-right text-[#566B69] dark:text-[#8FA8A4]">
              {formatCurrency(inv.sgstMinor)}
            </div>
          ),
        },
        {
          dataIndex: 'igstMinor',
          title: t('columns.igst'),
          sortable: true,
          align: 'right',
          render: (inv) => (
            <div className="text-right text-[#566B69] dark:text-[#8FA8A4]">
              {formatCurrency(inv.igstMinor)}
            </div>
          ),
        },
        {
          dataIndex: 'grandTotalMinor',
          title: t('columns.totalAmount'),
          sortable: true,
          align: 'right',
          render: (inv) => (
            <div className="text-right font-bold text-[#123B3A] dark:text-[#F0FDFA]">
              {formatCurrency(inv.grandTotalMinor)}
            </div>
          ),
        },
        {
          dataIndex: 'dueMinor',
          title: t('columns.due'),
          sortable: true,
          align: 'right',
          render: (inv) => (
            <div className="text-right font-bold text-[#B91C1C] dark:text-rose-400">
              {formatCurrency(inv.dueMinor)}
            </div>
          ),
        },
      ],
      emptyState: {
        title: t('empty.salesTitle'),
        description: t('empty.salesDesc'),
      },
      pagination: {
        defaultPageSize: 10,
        pageSizeOptions: [10, 20, 50, 100],
      },
      export: {
        filename: 'sales-register.csv',
      },
    }),
    [salesData, t]
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-2xl p-4 sm:p-5 shadow-xs">
          <span className="text-xs text-[#566B69] dark:text-[#8FA8A4] font-medium">{t('summary.totalInvoices')}</span>
          <h3 className="text-2xl font-bold text-[#123B3A] dark:text-[#F0FDFA] mt-1">
            {salesData?.summary?.totalInvoices || 0}
          </h3>
        </div>
        <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-2xl p-4 sm:p-5 shadow-xs">
          <span className="text-xs text-[#566B69] dark:text-[#8FA8A4] font-medium">{t('summary.totalTaxable')}</span>
          <h3 className="text-2xl font-bold text-[#123B3A] dark:text-[#F0FDFA] mt-1">
            {formatCurrency(salesData?.summary?.totalTaxableMinor || 0)}
          </h3>
        </div>
        <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-2xl p-4 sm:p-5 shadow-xs">
          <span className="text-xs text-[#566B69] dark:text-[#8FA8A4] font-medium">{t('summary.totalTax')}</span>
          <h3 className="text-2xl font-bold text-[#123B3A] dark:text-[#F0FDFA] mt-1">
            {formatCurrency(salesData?.summary?.totalTaxMinor || 0)}
          </h3>
        </div>
        <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-2xl p-4 sm:p-5 shadow-xs">
          <span className="text-xs text-[#566B69] dark:text-[#8FA8A4] font-medium">{t('summary.netSales')}</span>
          <h3 className="text-2xl font-black text-[#0F766E] dark:text-[#14B8A6] mt-1">
            {formatCurrency(salesData?.summary?.totalGrandMinor || 0)}
          </h3>
        </div>
      </div>

      <Table<any> option={tableOption} />
    </div>
  );
};
