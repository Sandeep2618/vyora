import React, { useMemo } from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Party } from '@/types';
import { formatCurrency } from '@/utils';
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
}) => {
  const { t } = useTranslation(['parties', 'common']);

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
            <div className="font-bold text-[#123B3A] dark:text-[#F0FDFA]">
              {party.name}
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
            return (
              <div className="text-right font-bold">
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
