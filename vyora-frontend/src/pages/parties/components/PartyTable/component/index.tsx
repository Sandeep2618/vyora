import React, { useMemo } from 'react';
import { Phone, Mail, MapPin, MessageSquare, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Party } from '@/types';
import { formatCurrency } from '@/utils';
import { useAuth } from '@/context/AuthContext';
import { Table, ITableOption, ITableEvent, TABLE_EVENT } from '@/components/Table';
import { PartyTableProps } from '../config/interface';
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
  onViewLedger,
}) => {
  const { t } = useTranslation(['parties', 'common']);
  const { business } = useAuth();

  const tableOption: ITableOption<Party> = useMemo(
    () => ({
      module: partyType === 'CUSTOMER' ? 'customers' : 'suppliers',
      rowKey: 'id',
      data: parties,
      search: false,
      isFiltered: hasActiveFilters,
      column: [
        {
          dataIndex: 'name',
          title: t('columns.name'),
          sortable: true,
          render: (party) => (
            <div>
              <button
                type="button"
                onClick={() => onViewLedger && onViewLedger(party)}
                className="font-bold text-left text-[#123B3A] dark:text-[#F0FDFA] hover:text-[#0F766E] dark:hover:text-[#14B8A6] transition-colors cursor-pointer"
                title="View customer ledger statement"
              >
                {party.name}
              </button>
              {party.contactPerson && (
                <p className="text-[10px] text-[#566B69] dark:text-[#8FA8A4] font-normal">
                  Attn: {party.contactPerson}
                </p>
              )}
            </div>
          ),
        },
        {
          dataIndex: 'phone',
          title: t('columns.phone'),
          sortable: true,
          render: (party) => (
            <div className="text-[#566B69] dark:text-[#8FA8A4]">
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
            </div>
          ),
        },
        {
          dataIndex: 'billingAddress.city',
          title: t('columns.location'),
          render: (party) => (
            <div className="flex items-center gap-1.5 text-[#566B69] dark:text-[#8FA8A4]">
              <MapPin className="w-3 h-3 text-[#566B69] dark:text-[#8FA8A4]" />
              <span>
                {party.billingAddress?.city || '-'}, {party.billingAddress?.state || '-'}
              </span>
            </div>
          ),
        },
        {
          dataIndex: 'gstin',
          title: t('columns.gstin'),
          render: (party) => (
            <span className="font-mono text-[#566B69] dark:text-[#8FA8A4]">
              {party.gstin || '-'}
            </span>
          ),
        },
        {
          dataIndex: 'currentBalanceMinor',
          title: t('columns.balance'),
          sortable: true,
          align: 'right',
          render: (party) => {
            const { className, type } = getBalanceVariant(party.currentBalanceMinor);
            const isDue = type === 'due' && (party.currentBalanceMinor || 0) > 0;

            const handleSendWhatsApp = (e: React.MouseEvent) => {
              e.stopPropagation();
              if (!party.phone) return;
              const clean = party.phone.replace(/[^0-9]/g, '');
              const phoneWithCountry = clean.length === 10 ? `91${clean}` : clean;
              const amountRupees = (party.currentBalanceMinor / 100).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
              });
              const storeName = business?.name?.trim() || 'Vyora Store';
              const msg = `Namaste ${party.name} Ji,\n\nThis is a friendly payment reminder from *${storeName}*.\n\nPending Ledger Balance: *₹${amountRupees}*\n\nKindly clear via UPI or Cash at the counter. Thank you!`;
              window.open(`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`, '_blank');
            };

            return (
              <div className="flex items-center justify-end gap-2 text-right font-bold">
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
                {isDue && party.phone && (
                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded transition-colors"
                    title="Send WhatsApp payment reminder"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          },
        },
        {
          dataIndex: 'action',
          title: t('columns.actions'),
          align: 'right',
          action: {
            edit: isOwner,
            delete: isOwner,
          },
        },
      ],
      emptyState: {
        title: t('empty.title'),
        description: t('empty.description'),
        actionLabel: isOwner
          ? partyType === 'CUSTOMER'
            ? t('actions.addCustomer', { ns: 'common' })
            : t('actions.addSupplier', { ns: 'common' })
          : undefined,
        onAction: onAddFirst,
      },
      filteredEmptyState: {
        title:
          partyType === 'CUSTOMER'
            ? 'No customers match filters'
            : 'No suppliers match filters',
        description: `No ${
          partyType === 'CUSTOMER' ? 'customer' : 'supplier'
        } records match your active search or balance filters. Reset filters to see all.`,
        actionLabel: t('actions.reset', { ns: 'common' }),
        onAction: onResetFilters,
      },
      pagination: {
        defaultPageSize: 10,
        pageSizeOptions: [10, 20, 50, 100],
      },
      export: {
        filename: `${partyType.toLowerCase()}s-directory.csv`,
      },
    }),
    [t, partyType, isOwner, onAddFirst, onResetFilters, parties, hasActiveFilters]
  );

  const handleTableEvent = (event: ITableEvent<Party>) => {
    if (event.type === TABLE_EVENT.ACTION_TRIGGER) {
      if (event.data.actionId === 'edit' && event.data.row) {
        onEdit(event.data.row);
      } else if (event.data.actionId === 'delete' && event.data.row) {
        onDelete(event.data.row);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center text-xs text-[#566B69] dark:text-[#8FA8A4]">
        <div className="w-6 h-6 border-2 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        {t('status.loading', { ns: 'common' })}
      </div>
    );
  }

  return (
    <Table<Party>
      option={tableOption}
      callBack={handleTableEvent}
    />
  );
};
