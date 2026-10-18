import React, { useMemo } from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatDateReadable } from '@/utils';
import { Table, ITableOption } from '@/components/Table';
import { PaymentRecord } from '@vyora/shared-types';
import { PaymentsTableProps } from '../config/interface';

export const PaymentsTable: React.FC<PaymentsTableProps> = ({ payments, headerActions }) => {
  const { t } = useTranslation(['payments', 'common']);

  const tableOption: ITableOption<PaymentRecord> = useMemo(
    () => ({
      module: 'payments',
      rowKey: 'id',
      data: payments,
      headerActions,
      countPill: true,
      search: {
        placeholder: t('actions.search', { ns: 'common', defaultValue: 'Search vouchers, party...' }),
      },
      column: [
        {
          dataIndex: 'paymentNumber',
          title: t('columns.voucherNo'),
          sortable: true,
          render: (p) => (
            <span className="font-mono font-bold text-[#0F766E] dark:text-[#14B8A6]">
              {p.paymentNumber}
            </span>
          ),
        },
        {
          dataIndex: 'type',
          title: t('columns.type'),
          sortable: true,
          render: (p) =>
            p.type === 'RECEIPT' ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#15803D] dark:text-[#34D399] bg-[#ECFDF5] dark:bg-[#064E3B]/40 px-2 py-0.5 rounded border border-[#A7F3D0] dark:border-[#065F46]">
                <ArrowDownLeft className="w-3 h-3" /> {t('button.receipt')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B91C1C] dark:text-[#F87171] bg-[#FEF2F2] dark:bg-[#7F1D1D]/40 px-2 py-0.5 rounded border border-[#FECACA] dark:border-[#991B1B]">
                <ArrowUpRight className="w-3 h-3" /> {t('button.payment')}
              </span>
            ),
        },
        {
          dataIndex: 'partyName',
          title: t('columns.partyName'),
          sortable: true,
          render: (p) => (
            <span className="font-bold text-[#123B3A] dark:text-[#F0FDFA]">
              {p.partyName}
            </span>
          ),
        },
        {
          dataIndex: 'paymentDate',
          title: t('columns.date'),
          sortable: true,
          render: (p) => (
            <span className="text-[#566B69] dark:text-[#8FA8A4]">
              {formatDateReadable(p.paymentDate)}
            </span>
          ),
        },
        {
          dataIndex: 'paymentMethod',
          title: t('columns.method'),
          sortable: true,
          render: (p) => (
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#F4F8F7] dark:bg-[#142B2A] border border-[#D7E5E2] dark:border-[#1E3B38] text-[#123B3A] dark:text-[#F0FDFA]">
              {p.paymentMethod.replace('_', ' ')}
            </span>
          ),
        },
        {
          dataIndex: 'referenceNumber',
          title: t('columns.reference'),
          render: (p) => (
            <span className="font-mono text-xs text-[#566B69] dark:text-[#8FA8A4]">
              {p.referenceNumber || '-'}
            </span>
          ),
        },
        {
          dataIndex: 'amountMinor',
          title: t('columns.amount'),
          sortable: true,
          align: 'right',
          render: (p) => (
            <div
              className={`text-right font-bold ${
                p.type === 'RECEIPT'
                  ? 'text-[#15803D] dark:text-[#34D399]'
                  : 'text-[#B91C1C] dark:text-[#F87171]'
              }`}
            >
              {p.type === 'RECEIPT' ? '+' : '-'}
              {formatCurrency(p.amountMinor)}
            </div>
          ),
        },
      ],
      emptyState: {
        title: t('empty.noResults', { defaultValue: 'No payment records' }),
        description: 'No payment or receipt transactions found.',
      },
      pagination: {
        defaultPageSize: 10,
        pageSizeOptions: [10, 20, 50, 100],
      },
      export: {
        filename: 'payments-ledger.csv',
      },
    }),
    [t, payments]
  );

  return <Table<PaymentRecord> option={tableOption} />;
};
