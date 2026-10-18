import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@vyora/utils';
import { Table, ITableOption } from '@/components/Table';
import { StockSummaryTabProps } from '../config/interface';

export const StockSummaryTab: React.FC<StockSummaryTabProps> = ({ stockData }) => {
  const { t } = useTranslation(['reports']);

  const tableOption: ITableOption<any> = useMemo(
    () => ({
      module: 'reports-stock',
      rowKey: 'id',
      data: stockData?.items || [],
      search: {
        placeholder: 'Search stock by product, SKU...',
      },
      column: [
        {
          dataIndex: 'name',
          title: t('columns.productName'),
          sortable: true,
          render: (item) => (
            <span className="font-semibold text-[#123B3A] dark:text-[#F0FDFA]">
              {item.name}
            </span>
          ),
        },
        {
          dataIndex: 'sku',
          title: t('columns.sku'),
          sortable: true,
          render: (item) => (
            <span className="font-mono font-bold text-[#0F766E] dark:text-[#14B8A6]">
              {item.sku}
            </span>
          ),
        },
        {
          dataIndex: 'unit',
          title: t('columns.unit'),
          align: 'center',
          render: (item) => (
            <span className="text-[#566B69] dark:text-[#8FA8A4]">
              {item.unit}
            </span>
          ),
        },
        {
          dataIndex: 'currentStock',
          title: t('columns.currentStock'),
          sortable: true,
          align: 'center',
          render: (item) => (
            <span className="font-bold text-[#123B3A] dark:text-[#F0FDFA]">
              {item.currentStock}
            </span>
          ),
        },
        {
          dataIndex: 'purchasePriceMinor',
          title: t('columns.costPrice'),
          sortable: true,
          align: 'right',
          render: (item) => (
            <div className="text-right font-medium text-[#123B3A] dark:text-[#F0FDFA]">
              {formatCurrency(item.purchasePriceMinor)}
            </div>
          ),
        },
        {
          dataIndex: 'valuationMinor',
          title: t('columns.valuation'),
          sortable: true,
          align: 'right',
          render: (item) => (
            <div className="text-right font-bold text-[#0F766E] dark:text-[#14B8A6]">
              {formatCurrency(item.valuationMinor)}
            </div>
          ),
        },
      ],
      emptyState: {
        title: t('empty.stockTitle'),
        description: t('empty.stockDesc'),
      },
      pagination: {
        defaultPageSize: 10,
        pageSizeOptions: [10, 20, 50, 100],
      },
      export: {
        filename: 'stock-summary.csv',
      },
    }),
    [stockData, t]
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-2xl p-4 sm:p-5 shadow-xs">
          <span className="text-xs text-[#566B69] dark:text-[#8FA8A4] font-medium">{t('summary.totalStockUnits')}</span>
          <h3 className="text-2xl font-bold text-[#123B3A] dark:text-[#F0FDFA] mt-1">
            {stockData?.summary?.totalStockQty || 0}
          </h3>
        </div>
        <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-2xl p-4 sm:p-5 shadow-xs">
          <span className="text-xs text-[#566B69] dark:text-[#8FA8A4] font-medium">{t('summary.totalValuation')}</span>
          <h3 className="text-2xl font-black text-[#0F766E] dark:text-[#14B8A6] mt-1">
            {formatCurrency(stockData?.summary?.totalValuationMinor || 0)}
          </h3>
        </div>
      </div>

      <Table<any> option={tableOption} />
    </div>
  );
};
