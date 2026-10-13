import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDateReadable } from '@/utils';
import { RecentInvoicesWidgetProps } from '../config/interface';
import { getRecentInvoiceStatusVariant } from '../util';

export const RecentInvoicesWidget: React.FC<RecentInvoicesWidgetProps> = ({ invoices }) => {
  const { t } = useTranslation(['dashboard', 'common']);

  return (
    <Card className="lg:col-span-2 p-5">
      <div className="flex items-center justify-between pb-4 border-b border-[#D7E5E2] dark:border-[#1E3B38]">
        <div>
          <h3 className="text-sm font-bold text-[#123B3A] dark:text-[#F0FDFA]">{t('recentInvoices.title')}</h3>
          <p className="text-xs text-[#566B69] dark:text-[#8FA8A4]">{t('recentInvoices.subtitle')}</p>
        </div>
        <Link
          to="/invoices"
          className="text-xs font-semibold text-[#0F766E] dark:text-[#14B8A6] hover:underline flex items-center gap-1"
        >
          {t('actions.viewAll', { ns: 'common' })} &rarr;
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto -mx-1 sm:mx-0">
        <table className="w-full text-left text-xs min-w-[500px] whitespace-nowrap">
          <thead>
            <tr className="border-b border-[#D7E5E2] dark:border-[#1E3B38] text-[#566B69] dark:text-[#8FA8A4] font-semibold">
              <th className="py-2.5 px-3">{t('recentInvoices.invoiceNo')}</th>
              <th className="py-2.5 px-3">{t('recentInvoices.customer')}</th>
              <th className="py-2.5 px-3">{t('recentInvoices.date')}</th>
              <th className="py-2.5 px-3 text-right">{t('recentInvoices.amount')}</th>
              <th className="py-2.5 px-3 text-center">{t('recentInvoices.status')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D7E5E2] dark:divide-[#1E3B38]">
            {invoices && invoices.length > 0 ? (
              invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#F4F8F7]/80 dark:hover:bg-[#142B2A]/50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-[#0F766E] dark:text-[#14B8A6]">
                    <Link to={`/invoices/${inv.id}`}>{inv.invoiceNumber}</Link>
                  </td>
                  <td className="py-3 px-3 text-[#123B3A] dark:text-[#F0FDFA] font-medium">{inv.customerName}</td>
                  <td className="py-3 px-3 text-[#566B69] dark:text-[#8FA8A4]">{formatDateReadable(inv.date)}</td>
                  <td className="py-3 px-3 font-bold text-[#123B3A] dark:text-[#F0FDFA] text-right">
                    {formatCurrency(inv.amountMinor)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Badge variant={getRecentInvoiceStatusVariant(inv.status)}>{inv.status}</Badge>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-10 text-center text-[#566B69] dark:text-[#8FA8A4]">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-10 h-10 rounded-xl bg-[#E6F4F2] dark:bg-[#162E2D] text-[#0F766E] dark:text-[#14B8A6] flex items-center justify-center mb-2">
                      <FileText className="w-5 h-5 opacity-80" />
                    </div>
                    <span className="font-semibold text-[#123B3A] dark:text-[#F0FDFA]">{t('empty.noData', { ns: 'common' })}</span>
                    <span className="text-[11px] text-[#566B69] dark:text-[#8FA8A4] mt-0.5 mb-3">
                      {t('salesOverview.noSalesDesc')}
                    </span>
                    <Link
                      to="/invoices/create"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0F766E] text-white text-xs font-semibold rounded-lg hover:bg-[#0D665F] transition-colors shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('actions.create', { ns: 'common' })}</span>
                    </Link>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
