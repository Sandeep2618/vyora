import React from 'react';
import { Invoice } from '@vyora/shared-types';
import { formatDateReadable } from '@vyora/utils';

interface ThermalReceiptTemplateProps {
  invoice: Invoice;
}

export const ThermalReceiptTemplate: React.FC<ThermalReceiptTemplateProps> = ({ invoice }) => {
  const biz = invoice.businessSnapshot;
  const customer = invoice.customerSnapshot;
  const grandTotalRupees = (invoice.grandTotalMinor / 100).toFixed(2);
  const upiUrl = biz?.upiId
    ? `https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(
        `upi://pay?pa=${biz.upiId}&pn=${encodeURIComponent(biz.name || 'Store')}&am=${grandTotalRupees}&cu=INR`
      )}`
    : null;

  return (
    <div className="mx-auto w-full max-w-[320px] bg-white p-4 font-mono text-xs text-black shadow-md border border-slate-200 rounded-lg print:border-none print:shadow-none print:p-0 print:m-0 print:w-[80mm] print:text-[11px]">
      {/* Store Header */}
      <div className="text-center space-y-1 pb-3 border-b border-dashed border-black">
        <h2 className="text-base font-black tracking-tight uppercase">
          {biz?.name || 'Vyora Store'}
        </h2>
        {biz?.address && <p className="text-[10px] leading-tight">{biz.address}, {biz.city}</p>}
        {biz?.gstin && <p className="text-[10px] font-bold">GSTIN: {biz.gstin}</p>}
        {biz?.phone && <p className="text-[10px]">Ph: {biz.phone}</p>}
      </div>

      {/* Bill Meta */}
      <div className="py-2.5 border-b border-dashed border-black text-[11px] space-y-1">
        <div className="flex justify-between">
          <span className="font-bold">Bill No:</span>
          <span className="font-black">{invoice.invoiceNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{formatDateReadable(invoice.issueDate)}</span>
        </div>
        <div className="flex justify-between">
          <span>Customer:</span>
          <span className="font-bold truncate max-w-[170px]">{customer.name}</span>
        </div>
        {customer.phone && (
          <div className="flex justify-between text-[10px]">
            <span>Phone:</span>
            <span>{customer.phone}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Status:</span>
          <span className="font-bold uppercase tracking-wider">{invoice.status}</span>
        </div>
      </div>

      {/* Line Items */}
      <div className="py-2.5 border-b border-dashed border-black">
        <div className="flex justify-between font-bold pb-1 text-[10px] border-b border-slate-300">
          <span>Item</span>
          <span>Qty x Rate</span>
          <span className="text-right">Amt</span>
        </div>

        <div className="divide-y divide-slate-100 py-1">
          {invoice.items.map((item, idx) => {
            const lineRateMajor = item.unitPriceMinor / 100;
            const lineTotalMajor = item.lineTotalMinor / 100;

            return (
              <div key={idx} className="py-1.5 space-y-0.5">
                <div className="flex justify-between font-bold text-[11px]">
                  <span className="truncate max-w-[180px]">{item.productName}</span>
                  <span>₹{lineTotalMajor.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-600">
                  <span>
                    {item.quantity} {item.unit || 'pcs'} x ₹{lineRateMajor.toFixed(2)}
                  </span>
                  {item.taxRatePercent > 0 && <span>GST {item.taxRatePercent}%</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Totals & Tax Summary */}
      <div className="py-2.5 border-b border-dashed border-black space-y-1 text-[11px]">
        <div className="flex justify-between">
          <span>Taxable Subtotal:</span>
          <span>₹{(invoice.totalTaxableAmountMinor / 100).toFixed(2)}</span>
        </div>
        {invoice.totalDiscountMinor > 0 && (
          <div className="flex justify-between">
            <span>Discount:</span>
            <span>-₹{(invoice.totalDiscountMinor / 100).toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Total Tax (GST):</span>
          <span>₹{(invoice.totalTaxMinor / 100).toFixed(2)}</span>
        </div>
        {(invoice.roundOffMinor || 0) !== 0 && (
          <div className="flex justify-between">
            <span>Round Off:</span>
            <span>₹{(invoice.roundOffMinor / 100).toFixed(2)}</span>
          </div>
        )}

        <div className="pt-2 border-t border-black flex justify-between font-black text-sm">
          <span>GRAND TOTAL:</span>
          <span>₹{grandTotalRupees}</span>
        </div>

        <div className="flex justify-between text-[10px] pt-1">
          <span>Amount Paid:</span>
          <span className="font-bold">₹{((invoice.grandTotalMinor - invoice.dueAmountMinor) / 100).toFixed(2)}</span>
        </div>
        {invoice.dueAmountMinor > 0 && (
          <div className="flex justify-between text-[10px] font-bold text-red-600">
            <span>Balance Due:</span>
            <span>₹{(invoice.dueAmountMinor / 100).toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* UPI QR Payment Code */}
      {upiUrl && invoice.dueAmountMinor > 0 && (
        <div className="py-3 text-center border-b border-dashed border-black space-y-1">
          <p className="text-[10px] font-bold uppercase">Scan to Pay via UPI</p>
          <img
            src={upiUrl}
            alt="UPI Payment QR"
            className="w-24 h-24 mx-auto border border-black p-1 rounded"
          />
          <p className="text-[9px] text-slate-600">{biz?.upiId}</p>
        </div>
      )}

      {/* Thank you footer */}
      <div className="pt-3 text-center space-y-1">
        <p className="font-bold text-[10px]">Thank you for your visit!</p>
        <p className="text-[9px] text-slate-500">Vyora Simple Business • vyora.in</p>
      </div>
    </div>
  );
};
