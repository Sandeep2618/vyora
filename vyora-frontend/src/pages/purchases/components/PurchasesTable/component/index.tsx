import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatDateReadable } from '@/utils';
import { Badge } from '@/components/ui/Badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { PurchasesTableProps } from '../config/interface';
import { DEFAULT_PAGE_SIZE } from '../config/constant';

export const PurchasesTable: React.FC<PurchasesTableProps> = ({ bills }) => {
  const { t } = useTranslation(['purchases', 'common']);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const paginatedBills = bills.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[#D7E5E2] dark:border-[#1E3B38] bg-white dark:bg-[#112322] overflow-hidden shadow-2xs">
        <Table className="min-w-[700px] whitespace-nowrap">
          <TableHeader>
            <TableRow>
              <TableHead>{t('columns.billNo', { ns: 'purchases' })}</TableHead>
              <TableHead>{t('columns.supplier', { ns: 'purchases' })}</TableHead>
              <TableHead>{t('columns.billDate', { ns: 'purchases' })}</TableHead>
              <TableHead className="text-center">{t('columns.items', { ns: 'purchases' })}</TableHead>
              <TableHead className="text-right">{t('columns.subtotal', { ns: 'purchases' })}</TableHead>
              <TableHead className="text-right">{t('columns.tax', { ns: 'purchases' })}</TableHead>
              <TableHead className="text-right">{t('columns.total', { ns: 'purchases' })}</TableHead>
              <TableHead className="text-center">{t('columns.status', { ns: 'purchases' })}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedBills.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-mono font-bold text-[#0F766E] dark:text-[#14B8A6]">
                  {b.billNumber}
                </TableCell>
                <TableCell className="font-bold text-[#123B3A] dark:text-[#F0FDFA]">
                  {b.supplierSnapshot?.name || '-'}
                </TableCell>
                <TableCell className="text-[#566B69] dark:text-[#8FA8A4]">
                  {formatDateReadable(b.billDate)}
                </TableCell>
                <TableCell className="text-center font-medium text-xs text-[#566B69] dark:text-[#8FA8A4]">
                  {b.items.length} items
                </TableCell>
                <TableCell className="text-right text-[#566B69] dark:text-[#8FA8A4]">
                  {formatCurrency(b.subtotalMinor)}
                </TableCell>
                <TableCell className="text-right text-[#566B69] dark:text-[#8FA8A4]">
                  {formatCurrency(b.totalTaxMinor)}
                </TableCell>
                <TableCell className="text-right font-bold text-[#123B3A] dark:text-[#F0FDFA]">
                  {formatCurrency(b.grandTotalMinor)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={b.status === 'RECEIVED' ? 'paid' : 'neutral'}>
                    {b.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={bills.length}
        itemsPerPage={pageSize}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setPageSize}
      />
    </div>
  );
};
