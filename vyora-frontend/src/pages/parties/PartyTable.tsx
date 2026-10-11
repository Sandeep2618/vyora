import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Edit2, Trash2 } from 'lucide-react';
import { Party, PartyType } from '../../types';
import { formatCurrency } from '../../utils';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/Table';

interface PartyTableProps {
  parties: Party[];
  isLoading: boolean;
  partyType: PartyType;
  hasActiveFilters?: boolean;
  isOwner?: boolean;
  onResetFilters?: () => void;
  onEdit: (party: Party) => void;
  onDelete: (party: Party) => void;
  onAddFirst: () => void;
}

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
  const [pageSize, setPageSize] = useState(10);

  // Reset page when party list length or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [parties.length, partyType, hasActiveFilters]);

  if (isLoading) {
    return (
      <div className="py-12 text-center text-xs text-[#566B69]">
        <div className="w-6 h-6 border-2 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading {partyType.toLowerCase()} records...
      </div>
    );
  }

  if (parties.length === 0) {
    return (
      <EmptyState
        title={
          hasActiveFilters
            ? `No ${partyType === 'CUSTOMER' ? 'customers' : 'suppliers'} match filters`
            : `No ${partyType === 'CUSTOMER' ? 'customers' : 'suppliers'} found`
        }
        description={
          hasActiveFilters
            ? `No ${partyType === 'CUSTOMER' ? 'customer' : 'supplier'} records match your active search or balance filters. Reset filters to see all.`
            : `Add your ${
                partyType === 'CUSTOMER' ? 'first customer' : 'first supplier'
              } to track orders, invoices, and ledger balances.`
        }
        actionLabel={hasActiveFilters ? 'Reset Filters' : isOwner ? `Add ${partyType === 'CUSTOMER' ? 'Customer' : 'Supplier'}` : undefined}
        onAction={hasActiveFilters ? onResetFilters : isOwner ? onAddFirst : undefined}
      />
    );
  }

  const paginatedParties = parties.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[#D7E5E2] bg-white overflow-hidden shadow-sm">
        <Table className="min-w-[680px] whitespace-nowrap">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>GSTIN</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedParties.map((party) => (
              <TableRow key={party.id}>
                <TableCell className="font-bold text-[#123B3A]">
                  {party.name}
                  {party.contactPerson && (
                    <p className="text-[10px] text-[#566B69] font-normal">
                      Attn: {party.contactPerson}
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-[#566B69]">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-[#0F766E]" />
                    <span>{party.phone}</span>
                  </div>
                  {party.email && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3 h-3 text-[#566B69]" />
                      <span>{party.email}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-[#566B69]">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-[#566B69]" />
                    <span>
                      {party.billingAddress.city}, {party.billingAddress.state}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-[#566B69]">
                  {party.gstin || '-'}
                </TableCell>
                <TableCell className="text-right font-bold">
                  <span
                    className={
                      party.currentBalanceMinor > 0
                        ? 'text-[#B91C1C]'
                        : party.currentBalanceMinor < 0
                        ? 'text-[#A16207]'
                        : 'text-[#15803D]'
                    }
                  >
                    {formatCurrency(Math.abs(party.currentBalanceMinor))}
                    <span className="text-[10px] ml-1 font-normal">
                      {party.currentBalanceMinor > 0
                        ? 'Due'
                        : party.currentBalanceMinor < 0
                        ? 'Payable'
                        : 'Settled'}
                    </span>
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {isOwner ? (
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(party)}
                        title={`Edit ${party.name}`}
                        className="p-1.5 rounded-lg text-[#0F766E] hover:bg-[#E6F4F2] hover:text-[#0D665F] transition-colors"
                        aria-label={`Edit ${party.name}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(party)}
                        title={`Delete ${party.name}`}
                        className="p-1.5 rounded-lg text-[#B91C1C] hover:bg-[#FEE2E2] hover:text-[#991B1B] transition-colors"
                        aria-label={`Delete ${party.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-[#566B69] italic">--</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={parties.length}
        itemsPerPage={pageSize}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(limit) => {
          setPageSize(limit);
          setCurrentPage(1);
        }}
        pageSizeOptions={[10, 25, 50, 100]}
      />
    </div>
  );
};
