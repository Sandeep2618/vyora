import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import { formatCurrency, formatDateReadable, majorToMinor, minorToMajor } from '@vyora/utils';
import { Party, Product, PurchaseBill, TaxRatePercent } from '@vyora/shared-types';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

export const PurchasesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [supplierId, setSupplierId] = useState('');
  const [billNumber, setBillNumber] = useState('');
  const [billDate, setBillDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const [lines, setLines] = useState<
    { productId: string; quantity: number; unitPriceMajor: number; taxRatePercent: TaxRatePercent }[]
  >([{ productId: '', quantity: 1, unitPriceMajor: 0, taxRatePercent: 18 }]);

  const { data: suppliers } = useQuery<{ items: Party[] }>({
    queryKey: ['parties', 'SUPPLIER'],
    queryFn: () => api.get('/parties?type=SUPPLIER'),
  });

  const { data: products } = useQuery<{ items: Product[] }>({
    queryKey: ['products'],
    queryFn: () => api.get('/products'),
  });

  const { data: bills, isLoading } = useQuery<{ items: PurchaseBill[]; total: number }>({
    queryKey: ['purchases'],
    queryFn: () => api.get('/purchases'),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      api.post('/purchases', {
        supplierId,
        billNumber,
        billDate,
        notes,
        items: lines
          .filter((l) => l.productId && l.quantity > 0)
          .map((l) => ({
            productId: l.productId,
            quantity: Number(l.quantity),
            unitPriceMinor: majorToMinor(Number(l.unitPriceMajor)),
            taxRatePercent: l.taxRatePercent,
          })),
      }),
    onSuccess: () => {
      setIsModalOpen(false);
      setSupplierId('');
      setBillNumber('');
      setLines([{ productId: '', quantity: 1, unitPriceMajor: 0, taxRatePercent: 18 }]);
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#123B3A]">Purchases (Supplier Bills)</h2>
          <p className="text-xs sm:text-sm text-[#566B69] mt-0.5">
            Record inventory replenishments, supplier payables, and inbound bills
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Record Purchase Bill</span>
          </Button>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white border border-[#D7E5E2] rounded-xl p-4 shadow-2xs space-y-4">
        <div className="overflow-x-auto -mx-1 sm:mx-0">
          <table className="w-full text-left text-xs min-w-[680px] whitespace-nowrap">
            <thead>
              <tr className="border-b border-[#D7E5E2] text-[#566B69] font-semibold bg-[#F4F8F7]/50">
                <th className="py-3 px-4">Bill No.</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Bill Date</th>
                <th className="py-3 px-4 text-center">Items</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
                <th className="py-3 px-4 text-right">Tax</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D7E5E2]">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#566B69]">
                    Loading purchase bills...
                  </td>
                </tr>
              ) : bills?.items && bills.items.length > 0 ? (
                bills.items.map((b) => (
                  <tr key={b.id} className="hover:bg-[#F4F8F7]/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0F766E]">
                      {b.billNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#123B3A]">
                      {b.supplierSnapshot.name}
                    </td>
                    <td className="py-3.5 px-4 text-[#566B69]">{formatDateReadable(b.billDate)}</td>
                    <td className="py-3.5 px-4 text-center font-medium">{b.items.length}</td>
                    <td className="py-3.5 px-4 text-right font-medium text-[#566B69]">
                      {formatCurrency(b.subtotalMinor)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-[#566B69]">
                      {formatCurrency(b.totalTaxMinor)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-[#123B3A]">
                      {formatCurrency(b.grandTotalMinor)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant="paid">{b.status}</Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[#566B69]">
                    No purchase bills recorded yet. Click "Record Purchase Bill" to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Purchase Bill Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Supplier Purchase Bill"
        description="Increases stock inventory traceably and logs supplier payable"
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#123B3A] mb-1">
                Select Supplier <span className="text-[#B91C1C] font-bold">*</span>
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#D7E5E2] rounded-lg text-[#123B3A] focus:outline-none focus:border-[#0F766E]"
              >
                <option value="">-- Choose Supplier --</option>
                {suppliers?.items.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.phone})
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Supplier Invoice / Bill No."
              value={billNumber}
              onChange={(e) => setBillNumber(e.target.value)}
              placeholder="e.g. SUP-2025-081"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Bill Date"
              type="date"
              value={billDate}
              onChange={(e) => setBillDate(e.target.value)}
              required
            />
            <Input
              label="Notes (Optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Received via BlueDart courier"
            />
          </div>

          {/* Lines */}
          <div className="border border-[#D7E5E2] rounded-lg p-3 space-y-2 bg-[#F4F8F7]/50">
            <div className="flex justify-between items-center pb-2 border-b border-[#D7E5E2]">
              <span className="text-xs font-bold text-[#123B3A]">Received Products</span>
              <button
                type="button"
                onClick={() =>
                  setLines((p) => [
                    ...p,
                    { productId: '', quantity: 1, unitPriceMajor: 0, taxRatePercent: 18 },
                  ])
                }
                className="text-xs font-semibold text-[#0F766E] hover:underline"
              >
                + Add Item
              </button>
            </div>

            {lines.map((line, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center text-xs">
                <div className="col-span-5">
                  <select
                    value={line.productId}
                    onChange={(e) => {
                      const prod = products?.items.find((p) => p.id === e.target.value);
                      setLines((prev) => {
                        const copy = [...prev];
                        copy[idx].productId = e.target.value;
                        if (prod) {
                          copy[idx].unitPriceMajor = minorToMajor(prod.purchasePriceMinor);
                          copy[idx].taxRatePercent = prod.taxRatePercent;
                        }
                        return copy;
                      });
                    }}
                    className="w-full px-2 py-1.5 bg-white border border-[#D7E5E2] rounded text-xs"
                  >
                    <option value="">Select product...</option>
                    {products?.items.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={line.quantity}
                    onChange={(e) => {
                      const qty = parseInt(e.target.value, 10) || 1;
                      setLines((prev) => {
                        const c = [...prev];
                        c[idx].quantity = qty;
                        return c;
                      });
                    }}
                    className="w-full px-2 py-1.5 bg-white border border-[#D7E5E2] rounded text-xs text-center"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Rate (₹)"
                    value={line.unitPriceMajor}
                    onChange={(e) => {
                      const rate = parseFloat(e.target.value) || 0;
                      setLines((prev) => {
                        const c = [...prev];
                        c[idx].unitPriceMajor = rate;
                        return c;
                      });
                    }}
                    className="w-full px-2 py-1.5 bg-white border border-[#D7E5E2] rounded text-xs text-right"
                  />
                </div>
                <div className="col-span-1 text-center">
                  <span className="text-[10px] text-[#566B69]">{line.taxRatePercent}%</span>
                </div>
                <div className="col-span-1 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (lines.length > 1) {
                        setLines((p) => p.filter((_, i) => i !== idx));
                      }
                    }}
                    className="text-[#B91C1C] p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              isLoading={createMutation.isPending}
              disabled={!supplierId || !billNumber.trim() || lines.every((l) => !l.productId)}
              onClick={() => createMutation.mutate()}
              className="w-full sm:w-auto"
            >
              Commit Purchase & Stock
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
