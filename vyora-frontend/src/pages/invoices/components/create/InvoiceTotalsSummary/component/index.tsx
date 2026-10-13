import React from 'react';
import { Lightbulb } from 'lucide-react';
import { formatCurrency } from '@/utils';
import { InvoiceTotalsSummaryProps } from '../config/interface';

export const InvoiceTotalsSummary: React.FC<InvoiceTotalsSummaryProps> = ({
  previewTotals,
  notes,
  onNotesChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-white dark:bg-slate-900 border border-[#D7E5E2] dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-[#123B3A] dark:text-slate-100 pb-2 border-b border-[#D7E5E2] dark:border-slate-800">
          Summary
        </h3>

        <div className="space-y-2 text-xs text-[#566B69] dark:text-slate-400">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-[#123B3A] dark:text-slate-200">
              {formatCurrency(previewTotals?.subtotalMinor ?? 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Discount</span>
            <span className="font-semibold text-[#123B3A] dark:text-slate-200">
              {formatCurrency(previewTotals?.totalDiscountMinor ?? 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>
              {previewTotals?.isInterState ? 'IGST (18%)' : 'CGST + SGST (18%)'}
            </span>
            <span className="font-semibold text-[#123B3A] dark:text-slate-200">
              {formatCurrency(previewTotals?.totalTaxMinor ?? 0)}
            </span>
          </div>
          {(previewTotals?.roundOffMinor ?? 0) !== 0 && (
            <div className="flex justify-between">
              <span>Round Off</span>
              <span className="font-semibold text-[#123B3A] dark:text-slate-200">
                {formatCurrency(previewTotals?.roundOffMinor ?? 0)}
              </span>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-[#D7E5E2] dark:border-slate-800 flex items-center justify-between">
          <span className="text-sm font-bold text-[#123B3A] dark:text-slate-100">Total Amount</span>
          <span className="text-xl font-black text-[#0F766E] dark:text-teal-400">
            {formatCurrency(previewTotals?.grandTotalMinor ?? 0)}
          </span>
        </div>
      </div>

      {/* Quick Tip Box */}
      <div className="bg-[#E6F4F2] dark:bg-teal-950/30 border border-[#D7E5E2] dark:border-teal-900/50 rounded-xl p-4 text-xs">
        <div className="flex items-center gap-2 text-[#0F766E] dark:text-teal-400 font-bold mb-1">
          <Lightbulb className="w-4 h-4" />
          <span>Quick Tip</span>
        </div>
        <p className="text-[#566B69] dark:text-slate-300 leading-relaxed">
          Finalizing an invoice assigns an irreversible sequential invoice number, atomically commits stock deductions, and updates client dues.
        </p>
      </div>

      {/* Notes Field */}
      <div className="bg-white dark:bg-slate-900 border border-[#D7E5E2] dark:border-slate-800 rounded-xl p-5 shadow-2xs">
        <h3 className="text-xs font-bold text-[#123B3A] dark:text-slate-100 mb-2">Notes (Optional)</h3>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Add any additional notes, payment instructions, or terms for this invoice..."
          className="w-full p-3 text-xs bg-[#F4F8F7] dark:bg-slate-800 border border-[#D7E5E2] dark:border-slate-700 rounded-lg text-[#123B3A] dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-[#0F766E] focus:bg-white dark:focus:bg-slate-800"
        />
      </div>
    </div>
  );
};
