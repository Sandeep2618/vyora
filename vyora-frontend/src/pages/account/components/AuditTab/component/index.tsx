import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/Badge';
import { Table, ITableOption } from '@/components/Table';
import { useAuditLogs } from '../hook';
import { formatAuditDate } from '../util';

export const AuditTab: React.FC = () => {
  const { t } = useTranslation('account');
  const { data: auditLogs, isLoading: isLoadingAudit } = useAuditLogs();

  const tableOption: ITableOption<any> = useMemo(
    () => ({
      module: 'audit-logs',
      rowKey: (row) => row._id || row.id,
      data: auditLogs?.items || [],
      search: {
        placeholder: 'Search audit logs...',
      },
      column: [
        {
          dataIndex: 'createdAt',
          title: t('auditTab.columns.dateTime', { defaultValue: 'Date & Time' }),
          sortable: true,
          render: (log) => (
            <span className="text-[#566B69] dark:text-[#8FA8A4] whitespace-nowrap">
              {formatAuditDate(log.createdAt)}
            </span>
          ),
        },
        {
          dataIndex: 'userName',
          title: t('auditTab.columns.actor', { defaultValue: 'Actor / User' }),
          sortable: true,
          render: (log) => (
            <span className="font-semibold text-[#123B3A] dark:text-[#E6F4F1]">
              {log.userName || log.actor || 'System'}
            </span>
          ),
        },
        {
          dataIndex: 'action',
          title: t('auditTab.columns.action', { defaultValue: 'Action Event' }),
          sortable: true,
          render: (log) => (
            <Badge variant="draft">{log.action || 'MUTATION'}</Badge>
          ),
        },
        {
          dataIndex: 'entity',
          title: t('auditTab.columns.entity', { defaultValue: 'Entity Type' }),
          sortable: true,
          render: (log) => (
            <span className="text-[#566B69] dark:text-[#8FA8A4]">
              {log.entity || log.collectionName || '-'}
            </span>
          ),
        },
      ],
      emptyState: {
        title: t('auditTab.noRecords', { defaultValue: 'No activity logged yet.' }),
        description: t('auditTab.subtitle', {
          defaultValue:
            'Comprehensive chronological log of user actions, role changes, invoices created, and stock alterations.',
        }),
      },
      pagination: {
        defaultPageSize: 10,
        pageSizeOptions: [10, 20, 50, 100],
      },
      export: {
        filename: 'audit-trail-register.csv',
      },
    }),
    [auditLogs, t]
  );

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-2xl p-6 shadow-xs">
        <h2 className="text-base font-bold text-[#123B3A] dark:text-[#E6F4F1]">
          {t('auditTab.title', { defaultValue: 'System Activity Audit Trail' })}
        </h2>
        <p className="text-xs text-[#566B69] dark:text-slate-400 mt-0.5">
          {t('auditTab.subtitle', {
            defaultValue:
              'Comprehensive chronological log of user actions, role changes, invoices created, and stock alterations.',
          })}
        </p>
      </div>

      {isLoadingAudit ? (
        <div className="py-12 text-center text-xs text-[#566B69] dark:text-slate-400 bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-2xl shadow-xs">
          <div className="w-6 h-6 border-2 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          {t('auditTab.loading', { defaultValue: 'Loading system audit records...' })}
        </div>
      ) : (
        <Table<any> option={tableOption} />
      )}
    </div>
  );
};
