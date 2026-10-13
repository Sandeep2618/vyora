import React, { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatDateReadable } from '@vyora/utils';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { PaymentsTableProps } from '../config/interface';
const DEFAULT_PAGE_SIZE = 10;

export const PaymentsTable: React.FC<PaymentsTableProps> = ({ payments }) => {
  const { t } = useTranslation(['payments', 'common']);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const paginatedPayments = payments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[#D7E5E2] dark:border-[#1E3B38] bg-white dark:bg-[#112322] overflow-hidden shadow-2xs">
        <Table className="min-w-[700px] whitespace-nowrap">
          <TableHeader>
            <TableRow>
              <TableHead>{t('columns.voucherNo')}</TableHead>
              <TableHead>{t('columns.type')}</TableHead>
              <TableHead>{t('columns.partyName')}</TableHead>
              <TableHead>{t('columns.date')}</TableHead>
              <TableHead>{t('columns.method')}</TableHead>
              <TableHead>{t('columns.reference')}</TableHead>
              <TableHead className="text-right">{t('columns.amount')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPayments.length > 0 ? (
              paginatedPayments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono font-bold text-[#0F766E] dark:text-[#14B8A6]">
                    {p.paymentNumber}
                  </TableCell>
                  <TableCell>
                    {p.type === 'RECEIPT' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#15803D] dark:text-[#34D399] bg-[#ECFDF5] dark:bg-[#064E3B]/40 px-2 py-0.5 rounded border border-[#A7F3D0] dark:border-[#065F46]">
                        <ArrowDownLeft className="w-3 h-3" /> {t('button.receipt')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B91C1C] dark:text-[#F87171] bg-[#FEF2F2] dark:bg-[#7F1D1D]/40 px-2 py-0.5 rounded border border-[#FECACA] dark:border-[#991B1B]">
                        <ArrowUpRight className="w-3 h-3" /> {t('button.payment')}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="font-bold text-[#123B3A] dark:text-[#F0FDFA]">{p.partyName}</TableCell>
                  <TableCell className="text-[#566B69] dark:text-[#8FA8A4]">
                    {formatDateReadable(p.paymentDate)}
                  </TableCell>
                  <TableCell className="text-[#566B69] dark:text-[#8FA8A4]">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#F4F8F7] dark:bg-[#142B2A] border border-[#D7E5E2] dark:border-[#1E3B38] text-[#123B3A] dark:text-[#F0FDFA]">
                      {p.paymentMethod.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[#566B69] dark:text-[#8FA8A4]">
                    {p.referenceNumber || '-'}
                  </TableCell>
                  <TableCell
                    className={`text-right font-bold ${
                      p.type === 'RECEIPT' ? 'text-[#15803D] dark:text-[#34D399]' : 'text-[#B91C1C] dark:text-[#F87171]'
                    }`}
                  >
                    {p.type === 'RECEIPT' ? '+' : '-'}
                    {formatCurrency(p.amountMinor)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-[#566B69] dark:text-[#8FA8A4]">
                  {t('empty.noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={payments.length}
        itemsPerPage={pageSize}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setPageSize}
      />
    </div>
  );
};
