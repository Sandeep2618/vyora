import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Edit2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Party } from '@/types';
import { formatCurrency } from '@/utils';
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
import { PartyTableProps } from '../config/interface';
const DEFAULT_PAGE_SIZE = 10;
import { getBalanceVariant } from '../util';

export const PartyTable: React.FC<PartyTableProps> = ({
  parties,
  isLoading,
  partyType,
  hasActiveFilters,
  isOwner = true,
  onResetFilters,
  onEdit,
  onDelete,
  onAddFirst,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const { t } = useTranslation(['parties', 'common']);

  // Reset page when party list length or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [parties.length, partyType, hasActiveFilters]);

  if (isLoading) {
    return (
      <div className="py-12 text-center text-xs text-[#566B69] dark:text-[#8FA8A4]">
        <div className="w-6 h-6 border-2 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        {t('status.loading', { ns: 'common' })}
      </div>
    );
  }

  if (parties.length === 0) {
    return (
      <EmptyState
        title={
          hasActiveFilters
            ? `No ${partyType === 'CUSTOMER' ? 'customers' : 'suppliers'} match filters`
            : t('empty.title')
        }
        description={
          hasActiveFilters
            ? `No ${partyType === 'CUSTOMER' ? 'customer' : 'supplier'} records match your active search or balance filters. Reset filters to see all.`
            : t('empty.description')
        }
        actionLabel={
          hasActiveFilters
            ? t('actions.reset', { ns: 'common' })
            : isOwner
            ? partyType === 'CUSTOMER'
              ? t('actions.addCustomer', { ns: 'common' })
              : t('actions.addSupplier', { ns: 'common' })
            : undefined
        }
        onAction={hasActiveFilters ? onResetFilters : isOwner ? onAddFirst : undefined}
      />
    );
  }

  const paginatedParties = parties.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[#D7E5E2] dark:border-[#1E3B38] bg-white dark:bg-[#112322] overflow-hidden shadow-2xs">
        <Table className="min-w-[680px] whitespace-nowrap">
          <TableHeader>
            <TableRow>
              <TableHead>{t('columns.name')}</TableHead>
              <TableHead>{t('columns.phone')}</TableHead>
              <TableHead>{t('columns.location')}</TableHead>
              <TableHead>{t('columns.gstin')}</TableHead>
              <TableHead className="text-right">{t('columns.balance')}</TableHead>
              <TableHead className="text-right">{t('columns.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedParties.map((party) => {
              const { className, type } = getBalanceVariant(party.currentBalanceMinor);

              return (
                <TableRow key={party.id}>
                  <TableCell className="font-bold text-[#123B3A] dark:text-[#F0FDFA]">
                    {party.name}
                    {party.contactPerson && (
                      <p className="text-[10px] text-[#566B69] dark:text-[#8FA8A4] font-normal">
                        Attn: {party.contactPerson}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-[#566B69] dark:text-[#8FA8A4]">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-[#0F766E] dark:text-[#14B8A6]" />
                      <span>{party.phone}</span>
                    </div>
                    {party.email && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-[#566B69] dark:text-[#8FA8A4]" />
                        <span>{party.email}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-[#566B69] dark:text-[#8FA8A4]">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-[#566B69] dark:text-[#8FA8A4]" />
                      <span>
                        {party.billingAddress?.city || '-'}, {party.billingAddress?.state || '-'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-[#566B69] dark:text-[#8FA8A4]">
                    {party.gstin || '-'}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    <span className={className}>
                      {formatCurrency(Math.abs(party.currentBalanceMinor))}
                      <span className="text-[10px] ml-1 font-normal">
                        {type === 'due'
                          ? t('balance.due')
                          : type === 'advance'
                          ? t('balance.advance')
                          : t('balance.settled')}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {isOwner && (
                        <>
                          <button
                            type="button"
                            onClick={() => onEdit(party)}
                            title="Edit"
                            className="p-1.5 text-[#566B69] dark:text-[#8FA8A4] hover:text-[#0F766E] dark:hover:text-[#14B8A6] hover:bg-[#E6F4F2] dark:hover:bg-[#162E2D] rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(party)}
                            title="Delete"
                            className="p-1.5 text-[#566B69] dark:text-[#8FA8A4] hover:text-[#B91C1C] dark:hover:text-rose-400 hover:bg-[#FEE2E2] dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={parties.length}
        itemsPerPage={pageSize}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setPageSize}
      />
    </div>
  );
};
