import React from 'react';
import { useTranslation } from 'react-i18next';
import { Lightbulb } from 'lucide-react';
import { formatCurrency } from '@/utils';
import { InvoiceTotalsSummaryProps } from '../config/interface';

export const InvoiceTotalsSummary: React.FC<InvoiceTotalsSummaryProps> = ({
  previewTotals,
  notes,
  onNotesChange,
}) => {
  const { t } = useTranslation('invoices');

  return (
    <div className="space-y-5">
      {/* Summary Card */}
      <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl p-5 shadow-2xs space-y-3.5">
        <h3 className="text-sm font-bold text-[#123B3A] dark:text-[#E6F4F1] pb-2 border-b border-[#D7E5E2] dark:border-[#1E3B38]">
          {t('createPage.summary', { defaultValue: 'Summary' })}
        </h3>

        <div className="space-y-2 text-xs text-[#566B69] dark:text-[#8FA8A4]">
          <div className="flex justify-between">
            <span>{t('createPage.subtotal', { defaultValue: 'Subtotal' })}</span>
            <span className="font-semibold text-[#123B3A] dark:text-[#E6F4F1]">
              {formatCurrency(previewTotals?.subtotalMinor ?? 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>{t('createPage.discount', { defaultValue: 'Discount' })}</span>
            <span className="font-semibold text-[#123B3A] dark:text-[#E6F4F1]">
              {formatCurrency(previewTotals?.totalDiscountMinor ?? 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>
              {previewTotals?.isInterState ? 'IGST (18%)' : 'CGST + SGST (18%)'}
            </span>
            <span className="font-semibold text-[#123B3A] dark:text-[#E6F4F1]">
              {formatCurrency(previewTotals?.totalTaxMinor ?? 0)}
            </span>
          </div>
          {(previewTotals?.roundOffMinor ?? 0) !== 0 && (
            <div className="flex justify-between">
              <span>Round Off</span>
              <span className="font-semibold text-[#123B3A] dark:text-[#E6F4F1]">
                {formatCurrency(previewTotals?.roundOffMinor ?? 0)}
              </span>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-[#D7E5E2] dark:border-[#1E3B38] flex items-center justify-between">
          <span className="text-sm font-bold text-[#123B3A] dark:text-[#E6F4F1]">
            {t('createPage.totalAmount', { defaultValue: 'Total Amount' })}
          </span>
          <span className="text-xl font-black text-[#0F766E] dark:text-[#14B8A6]">
            {formatCurrency(previewTotals?.grandTotalMinor ?? 0)}
          </span>
        </div>
      </div>

      {/* Quick Tip Box */}
      <div className="bg-[#E6F4F2] dark:bg-[#162E2D] border border-[#B3DCD6]/60 dark:border-[#1E3B38] rounded-xl p-4 text-xs">
        <div className="flex items-center gap-1.5 text-[#0F766E] dark:text-[#14B8A6] font-bold mb-1">
          <Lightbulb className="w-4 h-4 shrink-0" />
          <span>{t('createPage.quickTipTitle', { defaultValue: 'Quick Tip' })}</span>
        </div>
        <p className="text-[#566B69] dark:text-[#8FA8A4] leading-relaxed">
          {t('createPage.quickTipDesc', {
            defaultValue:
              'Finalizing an invoice assigns an irreversible sequential invoice number, atomically commits stock deductions, and updates client dues.',
          })}
        </p>
      </div>

      {/* Notes Field */}
      <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl p-5 shadow-2xs">
        <h3 className="text-xs font-bold text-[#123B3A] dark:text-[#E6F4F1] mb-2">
          {t('createPage.notes', { defaultValue: 'Notes (Optional)' })}
        </h3>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder={t('createPage.notesPlaceholder', {
            defaultValue: 'Add any additional notes, payment instructions, or terms for this invoice...',
          })}
          className="w-full p-2.5 text-xs bg-[#F4F8F7] dark:bg-[#0D1C1B] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-lg text-[#123B3A] dark:text-[#E6F4F1] placeholder-[#566B69]/60 dark:placeholder-[#8FA8A4]/60 focus:outline-none focus:ring-1.5 focus:ring-[#0F766E] focus:border-[#0F766E] focus:bg-white dark:focus:bg-[#0D1C1B] transition-all"
        />
      </div>
    </div>
  );
};
