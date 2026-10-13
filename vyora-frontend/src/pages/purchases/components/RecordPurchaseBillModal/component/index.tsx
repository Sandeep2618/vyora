import React from 'react';
import { Trash2, ChevronDown, PackageOpen } from 'lucide-react';
import { minorToMajor } from '@vyora/utils';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { cn } from '@/lib/utils';
import { RecordPurchaseBillModalProps } from '../config/interface';

export const RecordPurchaseBillModal: React.FC<RecordPurchaseBillModalProps> = ({
  isOpen,
  onClose,
  supplierId,
  onSupplierIdChange,
  suppliers,
  billNumber,
  onBillNumberChange,
  billDate,
  onBillDateChange,
  notes,
  onNotesChange,
  lines,
  onLinesChange,
  products,
  onSubmit,
  isSubmitting,
}) => {
  const hasProducts = products.length > 0;
  const isSubmitDisabled =
    !supplierId || !billNumber.trim() || !hasProducts || lines.every((l) => !l.productId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Supplier Purchase Bill"
      description="Increases stock inventory traceably and logs supplier payable"
      maxWidth="2xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            isLoading={isSubmitting}
            disabled={isSubmitDisabled}
            onClick={onSubmit}
            className="w-full sm:w-auto"
          >
            Commit Purchase & Stock
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Select Supplier"
            value={supplierId}
            onValueChange={onSupplierIdChange}
            placeholder={suppliers.length === 0 ? 'No suppliers registered in Parties' : 'Choose a supplier...'}
            required
            helperText={suppliers.length === 0 ? 'Add a supplier under Customers & Parties first' : undefined}
            options={suppliers.map((s) => ({
              label: `${s.name}${s.phone ? ` (${s.phone})` : ''}`,
              value: s.id,
            }))}
          />

          <Input
            label="Supplier Invoice / Bill No."
            value={billNumber}
            onChange={(e) => onBillNumberChange(e.target.value)}
            placeholder="e.g. SUP-2025-081"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DatePicker
            label="Bill Date"
            value={billDate}
            onChange={onBillDateChange}
            required
          />
          <Input
            label="Notes (Optional)"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="e.g. Received via BlueDart courier"
          />
        </div>

        {/* Lines */}
        <div className="border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl p-3.5 space-y-2.5 bg-[#F4F8F7]/50 dark:bg-[#0D1C1B]">
          <div className="flex justify-between items-center pb-2 border-b border-[#D7E5E2] dark:border-[#1E3B38]">
            <span className="text-xs font-bold text-[#123B3A] dark:text-[#E6F4F1]">Received Products</span>
            {hasProducts && (
              <button
                type="button"
                onClick={() =>
                  onLinesChange((p) => [
                    ...p,
                    { productId: '', quantity: 1, unitPriceMajor: '', taxRatePercent: 18 },
                  ])
                }
                className="text-xs font-bold text-[#0F766E] dark:text-[#14B8A6] hover:underline cursor-pointer"
              >
                + Add Item
              </button>
            )}
          </div>

          {!hasProducts ? (
            <div className="py-6 px-4 bg-white dark:bg-[#112322] border border-amber-200 dark:border-amber-900/50 rounded-xl text-center space-y-2">
              <PackageOpen className="w-8 h-8 text-amber-600 dark:text-amber-400 mx-auto opacity-80" />
              <p className="text-xs font-bold text-[#123B3A] dark:text-[#E6F4F1]">
                No products found in inventory
              </p>
              <p className="text-[11px] text-[#566B69] dark:text-slate-400 max-w-sm mx-auto">
                Please add products in the Products section before recording a supplier purchase bill.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {lines.map((line, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center text-xs">
                  {/* Product Dropdown */}
                  <div className="col-span-5 relative">
                    <select
                      value={line.productId}
                      onChange={(e) => {
                        const prod = products.find((p) => p.id === e.target.value);
                        onLinesChange((prev) => {
                          const copy = [...prev];
                          copy[idx].productId = e.target.value;
                          if (prod) {
                            copy[idx].unitPriceMajor = minorToMajor(prod.purchasePriceMinor);
                            copy[idx].taxRatePercent = prod.taxRatePercent;
                          }
                          return copy;
                        });
                      }}
                      className="w-full h-10 appearance-none pl-3 pr-8 bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl text-xs font-semibold text-[#123B3A] dark:text-[#E6F4F1] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] dark:focus:border-[#14B8A6] transition-all cursor-pointer"
                    >
                      <option value="">Select product...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} {p.sku ? `(${p.sku})` : ''}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#566B69] dark:text-[#8FA8A4] pointer-events-none opacity-70" />
                  </div>

                  {/* Quantity */}
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Qty"
                      value={line.quantity}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        const val = e.target.value;
                        onLinesChange((prev) => {
                          const c = [...prev];
                          c[idx].quantity = val;
                          return c;
                        });
                      }}
                      onBlur={(e) => {
                        const qty = Math.max(1, parseInt(e.target.value, 10) || 1);
                        onLinesChange((prev) => {
                          const c = [...prev];
                          c[idx].quantity = qty;
                          return c;
                        });
                      }}
                      className="w-full h-10 px-2.5 bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl text-xs text-center font-semibold text-[#123B3A] dark:text-[#E6F4F1] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] dark:focus:border-[#14B8A6] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>

                  {/* Rate (Unit Price) with currency prefix and no spinner */}
                  <div className="col-span-3 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#566B69] dark:text-slate-400 pointer-events-none">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0.00"
                      value={line.unitPriceMajor ?? ''}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        const val = e.target.value;
                        onLinesChange((prev) => {
                          const c = [...prev];
                          c[idx].unitPriceMajor = val;
                          return c;
                        });
                      }}
                      className="w-full h-10 pl-7 pr-3 bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl text-xs text-right font-semibold text-[#123B3A] dark:text-[#E6F4F1] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] dark:focus:border-[#14B8A6] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>

                  {/* Tax */}
                  <div className="col-span-1 text-center">
                    <span className="text-[11px] font-bold text-[#566B69] dark:text-slate-400">
                      {line.taxRatePercent}%
                    </span>
                  </div>

                  {/* Delete */}
                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (lines.length > 1) {
                          onLinesChange((p) => p.filter((_, i) => i !== idx));
                        }
                      }}
                      disabled={lines.length <= 1}
                      className={cn(
                        'p-1.5 rounded-lg transition-colors',
                        lines.length > 1
                          ? 'text-[#B91C1C] dark:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-950/40 cursor-pointer'
                          : 'text-[#8CA19F]/40 dark:text-slate-600 cursor-not-allowed',
                      )}
                      title="Remove row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
