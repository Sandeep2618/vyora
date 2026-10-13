import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/Badge';
import { useAuditLogs } from '../hook';
import { formatAuditDate } from '../util';

export const AuditTab: React.FC = () => {
  const { t } = useTranslation('account');
  const { data: auditLogs, isLoading: isLoadingAudit } = useAuditLogs();

  return (
    <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-2xl p-6 shadow-xs space-y-4">
      <div className="border-b border-[#D7E5E2] dark:border-[#1E3B38] pb-4">
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
        <div className="p-8 text-center text-xs text-[#566B69] dark:text-slate-400">
          {t('auditTab.loading', { defaultValue: 'Loading system audit records...' })}
        </div>
      ) : !auditLogs || !Array.isArray(auditLogs?.items) || auditLogs.items.length === 0 ? (
        <div className="p-8 text-center text-xs text-[#566B69] dark:text-slate-400">
          {t('auditTab.noRecords', { defaultValue: 'No activity logged yet.' })}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#D7E5E2] dark:border-[#1E3B38] text-[#566B69] dark:text-slate-400 font-semibold">
                <th className="py-2.5 px-3">{t('auditTab.columns.dateTime', { defaultValue: 'Date & Time' })}</th>
                <th className="py-2.5 px-3">{t('auditTab.columns.actor', { defaultValue: 'Actor / User' })}</th>
                <th className="py-2.5 px-3">{t('auditTab.columns.action', { defaultValue: 'Action Event' })}</th>
                <th className="py-2.5 px-3">{t('auditTab.columns.entity', { defaultValue: 'Entity Type' })}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EFEB] dark:divide-[#1E3B38]">
              {auditLogs.items.map((log, idx) => (
                <tr key={log._id || log.id || idx} className="hover:bg-[#F4F8F7]/60 dark:hover:bg-[#162E2D]/60">
                  <td className="py-3 px-3 text-[#566B69] dark:text-slate-400">
                    {formatAuditDate(log.createdAt)}
                  </td>
                  <td className="py-3 px-3 font-semibold text-[#123B3A] dark:text-[#E6F4F1]">
                    {log.userName || log.actor || 'System'}
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant="draft">{log.action || 'MUTATION'}</Badge>
                  </td>
                  <td className="py-3 px-3 text-[#566B69] dark:text-slate-400">
                    {log.entity || log.collectionName || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
