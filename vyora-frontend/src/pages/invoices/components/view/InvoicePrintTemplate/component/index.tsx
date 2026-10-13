import React from 'react';
import { formatCurrency, formatDateReadable } from '@/utils';
import { Button } from '@/components/ui/Button';
import { InvoicePrintTemplateProps } from '../config/interface';

export const InvoicePrintTemplate: React.FC<InvoicePrintTemplateProps> = ({
  invoice,
  isOwner,
  onRecordPaymentClick,
}) => {
  return (
    <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl p-4 sm:p-8 lg:p-12 shadow-sm text-[#123B3A] dark:text-[#E6F4F1] print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
      {/* Document Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 sm:pb-8 border-b-2 border-[#0F766E]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#0F766E] text-white flex items-center justify-center font-black text-lg">
              V
            </div>
            <h1 className="text-2xl font-black text-[#123B3A] dark:text-[#E6F4F1] tracking-tight">
              {invoice.businessSnapshot?.name || 'Vyora Business'}
            </h1>
          </div>
          <p className="text-xs text-[#566B69] dark:text-slate-400 max-w-sm leading-relaxed">
            {invoice.businessSnapshot?.address}, {invoice.businessSnapshot?.city},{' '}
            {invoice.businessSnapshot?.state} - {invoice.businessSnapshot?.pincode}
          </p>
          {invoice.businessSnapshot?.gstin && (
            <p className="text-xs font-semibold text-[#123B3A] dark:text-[#E6F4F1] mt-1">
              GSTIN: <span className="font-mono">{invoice.businessSnapshot.gstin}</span>
            </p>
          )}
          <p className="text-xs text-[#566B69] dark:text-slate-400">
            Phone: {invoice.businessSnapshot?.phone} • Email: {invoice.businessSnapshot?.email}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="inline-block px-3 py-1 bg-[#E6F4F2] dark:bg-[#1E3B38] text-[#0F766E] dark:text-[#14B8A6] font-black text-sm tracking-wider uppercase rounded-md mb-2">
            TAX INVOICE
          </span>
          <p className="text-sm font-bold text-[#123B3A] dark:text-[#E6F4F1]">
            Invoice No: <span className="font-mono text-[#0F766E] dark:text-[#14B8A6]">{invoice.invoiceNumber}</span>
          </p>
          <p className="text-xs text-[#566B69] dark:text-slate-400 mt-0.5">
            Date: {formatDateReadable(invoice.issueDate)}
          </p>
          <p className="text-xs text-[#566B69] dark:text-slate-400">
            Due Date: {formatDateReadable(invoice.dueDate)}
          </p>
          <p className="text-xs text-[#566B69] dark:text-slate-400 mt-1">
            Place of Supply: {invoice.customerSnapshot.state}
          </p>
        </div>
      </div>

      {/* Bill To & Ship To */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 py-6 border-b border-[#D7E5E2] dark:border-[#1E3B38] text-xs">
        <div>
          <span className="font-bold text-[#0F766E] dark:text-[#14B8A6] uppercase tracking-wider block mb-1">
            Billed To:
          </span>
          <p className="font-bold text-sm text-[#123B3A] dark:text-[#E6F4F1]">{invoice.customerSnapshot.name}</p>
          <p className="text-[#566B69] dark:text-slate-400 mt-0.5">{invoice.customerSnapshot.address}</p>
          <p className="text-[#566B69] dark:text-slate-400">State: {invoice.customerSnapshot.state}</p>
          {invoice.customerSnapshot.gstin && (
            <p className="font-semibold text-[#123B3A] dark:text-[#E6F4F1] mt-1">
              GSTIN: <span className="font-mono">{invoice.customerSnapshot.gstin}</span>
            </p>
          )}
          <p className="text-[#566B69] dark:text-slate-400">Phone: {invoice.customerSnapshot.phone}</p>
        </div>

        <div className="bg-[#F4F8F7] dark:bg-[#0D1C1B] p-4 rounded-lg border border-[#D7E5E2] dark:border-[#1E3B38]">
          <span className="font-bold text-[#123B3A] dark:text-[#E6F4F1] uppercase tracking-wider block mb-1">
            Payment Summary
          </span>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-[#566B69] dark:text-slate-400">Invoice Total:</span>
              <span className="font-bold text-[#123B3A] dark:text-[#E6F4F1]">{formatCurrency(invoice.grandTotalMinor)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#566B69] dark:text-slate-400">Paid Amount:</span>
              <span className="font-bold text-[#15803D] dark:text-emerald-400">{formatCurrency(invoice.paidAmountMinor)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-[#D7E5E2] dark:border-[#1E3B38]">
              <span className="font-bold text-[#123B3A] dark:text-[#E6F4F1]">Balance Due:</span>
              <span className="font-bold text-[#B91C1C] dark:text-rose-400">{formatCurrency(invoice.dueAmountMinor)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Table */}
      <div className="py-6 overflow-x-auto -mx-2 sm:mx-0">
        <table className="w-full text-left text-xs min-w-[650px] whitespace-nowrap">
          <thead>
            <tr className="border-b-2 border-[#123B3A] dark:border-[#14B8A6] text-[#123B3A] dark:text-[#E6F4F1] font-bold">
              <th className="py-2.5 px-2 w-8">#</th>
              <th className="py-2.5 px-2">Description</th>
              <th className="py-2.5 px-2 w-16">HSN</th>
              <th className="py-2.5 px-2 text-center w-16">Qty</th>
              <th className="py-2.5 px-2 text-right w-20">Rate</th>
              <th className="py-2.5 px-2 text-right w-20">Taxable</th>
              <th className="py-2.5 px-2 text-center w-14">GST %</th>
              <th className="py-2.5 px-2 text-right w-20">Tax</th>
              <th className="py-2.5 px-2 text-right w-24">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D7E5E2] dark:divide-[#1E3B38]">
            {invoice.items.map((item, idx) => (
              <tr key={idx}>
                <td className="py-3 px-2 text-[#566B69] dark:text-slate-400">{idx + 1}</td>
                <td className="py-3 px-2">
                  <p className="font-bold text-[#123B3A] dark:text-[#E6F4F1]">{item.productName}</p>
                  <p className="text-[10px] text-[#566B69] dark:text-slate-400">SKU: {item.sku}</p>
                </td>
                <td className="py-3 px-2 text-[#566B69] dark:text-slate-400 font-mono">{item.hsnCode || '-'}</td>
                <td className="py-3 px-2 text-center font-medium">
                  {item.quantity} {item.unit}
                </td>
                <td className="py-3 px-2 text-right">{formatCurrency(item.unitPriceMinor)}</td>
                <td className="py-3 px-2 text-right">{formatCurrency(item.unitPriceMinor * item.quantity)}</td>
                <td className="py-3 px-2 text-center font-medium">{item.taxRatePercent}%</td>
                <td className="py-3 px-2 text-right">{formatCurrency(item.totalTaxMinor)}</td>
                <td className="py-3 px-2 text-right font-bold text-[#123B3A] dark:text-[#E6F4F1]">
                  {formatCurrency(item.lineTotalMinor)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Calculation Totals Breakdown */}
      <div className="pt-4 border-t-2 border-[#D7E5E2] dark:border-[#1E3B38] flex justify-end text-xs">
        <div className="w-full sm:w-80 ml-auto space-y-2">
          <div className="flex justify-between text-[#566B69] dark:text-slate-400">
            <span>Subtotal:</span>
            <span className="font-semibold text-[#123B3A] dark:text-[#E6F4F1]">
              {formatCurrency(invoice.subtotalMinor)}
            </span>
          </div>
          {invoice.totalDiscountMinor > 0 && (
            <div className="flex justify-between text-[#566B69] dark:text-slate-400">
              <span>Discount:</span>
              <span className="font-semibold text-[#123B3A] dark:text-[#E6F4F1]">
                -{formatCurrency(invoice.totalDiscountMinor)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-[#566B69] dark:text-slate-400">
            <span>Taxable Amount:</span>
            <span className="font-semibold text-[#123B3A] dark:text-[#E6F4F1]">
              {formatCurrency(invoice.totalTaxableAmountMinor)}
            </span>
          </div>

          {invoice.isInterState ? (
            <div className="flex justify-between text-[#566B69] dark:text-slate-400">
              <span>IGST:</span>
              <span className="font-semibold text-[#123B3A] dark:text-[#E6F4F1]">
                {formatCurrency(invoice.igstMinor)}
              </span>
            </div>
          ) : (
            <>
              <div className="flex justify-between text-[#566B69] dark:text-slate-400">
                <span>CGST:</span>
                <span className="font-semibold text-[#123B3A] dark:text-[#E6F4F1]">
                  {formatCurrency(invoice.cgstMinor)}
                </span>
              </div>
              <div className="flex justify-between text-[#566B69] dark:text-slate-400">
                <span>SGST:</span>
                <span className="font-semibold text-[#123B3A] dark:text-[#E6F4F1]">
                  {formatCurrency(invoice.sgstMinor)}
                </span>
              </div>
            </>
          )}

          {invoice.roundOffMinor !== 0 && (
            <div className="flex justify-between text-[#566B69] dark:text-slate-400">
              <span>Round Off:</span>
              <span className="font-semibold text-[#123B3A] dark:text-[#E6F4F1]">
                {formatCurrency(invoice.roundOffMinor)}
              </span>
            </div>
          )}

          <div className="pt-2 border-t-2 border-[#0F766E] flex justify-between text-sm font-bold text-[#123B3A] dark:text-[#E6F4F1]">
            <span>Grand Total:</span>
            <span className="text-base font-black text-[#0F766E] dark:text-[#14B8A6]">
              {formatCurrency(invoice.grandTotalMinor)}
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic UPI Payment QR Code */}
      {invoice.dueAmountMinor > 0 && invoice.status !== 'CANCELLED' && (
        <div className="mt-6 p-4 rounded-xl border border-[#D7E5E2] dark:border-[#1E3B38] bg-[#F4F8F7]/60 dark:bg-[#0D1C1B] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-1.5 bg-white rounded-lg border border-[#D7E5E2] shrink-0 shadow-2xs">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(
                  `upi://pay?pa=vyora.merchant@icici&pn=${encodeURIComponent(
                    invoice.businessSnapshot?.name || 'Vyora Business'
                  )}&am=${(invoice.dueAmountMinor / 100).toFixed(2)}&tr=${invoice.invoiceNumber}&cu=INR`
                )}`}
                alt="Invoice UPI QR"
                className="w-24 h-24"
              />
            </div>
            <div>
              <p className="text-xs font-bold text-[#123B3A] dark:text-[#E6F4F1]">Instant UPI Counter Payment</p>
              <p className="text-[11px] text-[#566B69] dark:text-slate-400 mt-0.5">
                Scan with GPay, PhonePe, Paytm, or BHIM to pay outstanding amount of{' '}
                <strong className="text-[#0F766E] dark:text-[#14B8A6]">{formatCurrency(invoice.dueAmountMinor)}</strong>.
              </p>
              <p className="text-[10px] font-mono text-[#0F766E] dark:text-[#14B8A6] mt-1">
                VPA: vyora.merchant@icici • Invoice: {invoice.invoiceNumber}
              </p>
            </div>
          </div>
          {isOwner && invoice.status !== 'PAID' && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRecordPaymentClick}
              className="shrink-0"
            >
              Record Payment
            </Button>
          )}
        </div>
      )}

      {/* Footer Terms & Signatory */}
      <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-[#D7E5E2] dark:border-[#1E3B38] grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 text-xs">
        <div>
          <h4 className="font-bold text-[#123B3A] dark:text-[#E6F4F1] mb-1">Terms & Conditions</h4>
          <p className="text-[#566B69] dark:text-slate-400 leading-relaxed whitespace-pre-line">
            {invoice.terms ||
              '1. Goods once sold will not be taken back without original packaging.\n2. Payment is due strictly per stated invoice terms.\n3. Subject to local jurisdiction.'}
          </p>
        </div>
        <div className="text-left sm:text-right flex flex-col justify-end">
          <div className="border-b border-[#123B3A] dark:border-[#E6F4F1] w-48 sm:ml-auto pb-1 mb-1"></div>
          <p className="font-bold text-[#123B3A] dark:text-[#E6F4F1]">
            For {invoice.businessSnapshot?.name || 'Vyora Business'}
          </p>
          <p className="text-[#566B69] dark:text-slate-400 text-[10px]">Authorized Signatory</p>
        </div>
      </div>
    </div>
  );
};
