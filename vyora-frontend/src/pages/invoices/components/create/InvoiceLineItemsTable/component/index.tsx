import React from 'react';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { InvoiceLineItemsTableProps } from '../config/interface';
import { calculateLineTotal } from '../util';

export const InvoiceLineItemsTable: React.FC<InvoiceLineItemsTableProps> = ({
  lines,
  products,
  onProductSelect,
  onUpdateLine,
  onAddLine,
  onRemoveLine,
}) => {
  return (
    <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#D7E5E2] dark:border-[#1E3B38]">
        <h3 className="text-sm font-bold text-[#123B3A] dark:text-[#E6F4F1]">Add Items</h3>
        <Button size="sm" variant="outline" onClick={onAddLine}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Item
        </Button>
      </div>

      {products.length === 0 && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-200 text-center">
          No products in catalog. Please add items in the Products section to add them to invoices.
        </div>
      )}

      <div className="overflow-x-auto -mx-1 sm:mx-0">
        <table className="w-full text-left text-xs min-w-[650px] whitespace-nowrap">
          <thead>
            <tr className="border-b border-[#D7E5E2] dark:border-[#1E3B38] text-[#566B69] dark:text-slate-400 font-semibold bg-[#F4F8F7]/50 dark:bg-[#162E2D]">
              <th className="py-2.5 px-2 w-8">#</th>
              <th className="py-2.5 px-2 min-w-[160px]">Product / Service</th>
              <th className="py-2.5 px-2 w-20">HSN/SAC</th>
              <th className="py-2.5 px-2 w-20 text-center">Qty</th>
              <th className="py-2.5 px-2 w-24 text-right">Rate (₹)</th>
              <th className="py-2.5 px-2 w-24 text-right">Amount (₹)</th>
              <th className="py-2.5 px-2 w-10 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D7E5E2] dark:divide-[#1E3B38]">
            {lines.map((line, idx) => {
              const lineTotal = calculateLineTotal(line.quantity, line.rateMajor);

              return (
                <tr key={idx} className="hover:bg-[#F4F8F7]/40 dark:hover:bg-[#162E2D]/40">
                  <td className="py-2 px-2 text-[#566B69] dark:text-slate-400 font-medium">{idx + 1}</td>
                  <td className="py-2 px-2">
                    <div className="relative">
                      <select
                        value={line.productId}
                        onChange={(e) => onProductSelect(idx, e.target.value)}
                        className="w-full appearance-none pl-2.5 pr-7 py-1.5 bg-white dark:bg-[#0D1C1B] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-lg text-xs font-medium text-[#123B3A] dark:text-[#E6F4F1] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#14B8A6] cursor-pointer"
                      >
                        <option value="">
                          {products.length === 0 ? 'No items in catalog' : 'Select item...'}
                        </option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Stock: {p.currentStock} {p.unit})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#566B69] dark:text-[#8FA8A4] pointer-events-none opacity-70" />
                    </div>
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={line.hsnCode || ''}
                      onChange={(e) => onUpdateLine(idx, 'hsnCode', e.target.value)}
                      className="w-full px-2 py-1.5 bg-[#F4F8F7] dark:bg-[#0D1C1B] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-lg text-xs text-[#123B3A] dark:text-[#E6F4F1]"
                    />
                  </td>
                  <td className="py-2 px-2 text-center">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={line.quantity}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => onUpdateLine(idx, 'quantity', e.target.value)}
                      onBlur={(e) => {
                        const qty = Math.max(1, parseInt(e.target.value, 10) || 1);
                        onUpdateLine(idx, 'quantity', qty);
                      }}
                      className="w-16 px-2 py-1.5 bg-white dark:bg-[#0D1C1B] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-lg text-xs text-center font-semibold text-[#123B3A] dark:text-[#E6F4F1] focus:outline-none focus:border-[#0F766E] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </td>
                  <td className="py-2 px-2 text-right">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0.00"
                      value={line.rateMajor ?? ''}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => onUpdateLine(idx, 'rateMajor', e.target.value)}
                      className="w-20 px-2 py-1.5 bg-white dark:bg-[#0D1C1B] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-lg text-xs text-right font-semibold text-[#123B3A] dark:text-[#E6F4F1] focus:outline-none focus:border-[#0F766E] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </td>
                  <td className="py-2 px-2 text-right font-bold text-[#123B3A] dark:text-[#E6F4F1]">
                    {lineTotal.toFixed(2)}
                  </td>
                  <td className="py-2 px-2 text-center">
                    <button
                      type="button"
                      onClick={() => onRemoveLine(idx)}
                      className="text-[#B91C1C] dark:text-rose-400 hover:opacity-75 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Button size="sm" variant="ghost" onClick={onAddLine} className="mt-2 text-xs">
        <Plus className="w-3.5 h-3.5 mr-1" />
        Add Item
      </Button>
    </div>
  );
};
