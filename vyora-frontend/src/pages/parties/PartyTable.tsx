import React from 'react';
import { Phone, Mail, MapPin, Edit2, Trash2 } from 'lucide-react';
import { Party, PartyType } from '../../types';
import { formatCurrency } from '../../utils';
import { EmptyState } from '../../components/ui/EmptyState';

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

  return (
    <div className="overflow-x-auto -mx-1 sm:mx-0">
      <table className="w-full text-left text-xs min-w-[680px] whitespace-nowrap">
        <thead>
          <tr className="border-b border-[#D7E5E2] text-[#566B69] font-semibold bg-[#F4F8F7]/50">
            <th className="py-3 px-4">Name</th>
            <th className="py-3 px-4">Contact</th>
            <th className="py-3 px-4">Location</th>
            <th className="py-3 px-4">GSTIN</th>
            <th className="py-3 px-4 text-right">Balance</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#D7E5E2]">
          {parties.map((party) => (
            <tr key={party.id} className="hover:bg-[#F4F8F7]/60 transition-colors">
              <td className="py-3.5 px-4 font-bold text-[#123B3A]">
                {party.name}
                {party.contactPerson && (
                  <p className="text-[10px] text-[#566B69] font-normal">
                    Attn: {party.contactPerson}
                  </p>
                )}
              </td>
              <td className="py-3.5 px-4 text-[#566B69]">
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
              </td>
              <td className="py-3.5 px-4 text-[#566B69]">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-[#566B69]" />
                  <span>
                    {party.billingAddress.city}, {party.billingAddress.state}
                  </span>
                </div>
              </td>
              <td className="py-3.5 px-4 font-mono text-[#566B69]">
                {party.gstin || '-'}
              </td>
              <td className="py-3.5 px-4 text-right font-bold">
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
              </td>
              <td className="py-3.5 px-4 text-right">
                {isOwner ? (
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onEdit(party)}
                      title={`Edit ${party.name}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0F766E] bg-[#E6F4F2] hover:bg-[#0F766E] hover:text-white rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => onDelete(party)}
                      title={`Delete ${party.name}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#B91C1C] bg-[#FEE2E2] hover:bg-[#B91C1C] hover:text-white rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-[#566B69] italic">--</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
