import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { StockMovementTableProps } from '../config/interface';
const DEFAULT_PAGE_SIZE = 10;
import { getMovementBadgeVariant } from '../util';

export const StockMovementTable: React.FC<StockMovementTableProps> = ({
  movements,
  isLoading,
  canAdjust = true,
  onOpenAdjustment,
}) => {
  const { t } = useTranslation(['inventory', 'common']);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const paginatedMovements = movements.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  if (isLoading) {
    return (
      <div className="py-12 text-center text-xs text-[#566B69] dark:text-[#8FA8A4]">
        <div className="w-6 h-6 border-2 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        {t('status.loading', { ns: 'common' })}
      </div>
    );
  }

  if (movements.length === 0) {
    return (
      <EmptyState
        title={t('empty.title')}
        description={t('empty.description')}
        actionLabel={canAdjust ? t('empty.action') : undefined}
        onAction={canAdjust ? onOpenAdjustment : undefined}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[#D7E5E2] dark:border-[#1E3B38] bg-white dark:bg-[#112322] overflow-hidden shadow-2xs">
        <Table className="min-w-[700px] whitespace-nowrap">
          <TableHeader>
            <TableRow>
              <TableHead>{t('columns.dateTime')}</TableHead>
              <TableHead>{t('columns.productName')}</TableHead>
              <TableHead>{t('columns.sku')}</TableHead>
              <TableHead className="text-center">{t('columns.movementType')}</TableHead>
              <TableHead className="text-center">{t('columns.change')}</TableHead>
              <TableHead className="text-center">{t('columns.resultingStock')}</TableHead>
              <TableHead>{t('columns.reason')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedMovements.map((m) => {
              const { variant, text } = getMovementBadgeVariant(m.movementType, m.quantityDelta);

              return (
                <TableRow key={m.id}>
                  <TableCell className="text-[#566B69] dark:text-[#8FA8A4]">
                    {new Date(m.createdAt).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell className="font-bold text-[#123B3A] dark:text-[#F0FDFA]">{m.productName}</TableCell>
                  <TableCell className="font-mono font-semibold text-[#0F766E] dark:text-[#14B8A6]">{m.sku}</TableCell>
                  <TableCell className="text-center">
                    <span className="font-semibold text-[#123B3A] dark:text-[#F0FDFA] text-[11px]">
                      {m.movementType}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={variant}>{text}</Badge>
                  </TableCell>
                  <TableCell className="text-center font-bold text-[#123B3A] dark:text-[#F0FDFA]">
                    {m.resultingStock} {m.unit}
                  </TableCell>
                  <TableCell className="text-[#566B69] dark:text-[#8FA8A4] italic max-w-xs truncate">
                    {m.reason || m.referenceType || '-'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={movements.length}
        itemsPerPage={pageSize}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setPageSize}
      />
    </div>
  );
};
