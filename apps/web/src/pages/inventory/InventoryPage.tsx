import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ArrowDown, ArrowUp, ArrowLeftRight, Clock, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { formatDateReadable } from '@vyora/utils';
import { Product, StockMovement } from '@vyora/shared-types';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

export const InventoryPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [deltaQty, setDeltaQty] = useState<number>(0);
  const [reason, setReason] = useState('');

  const { data: products } = useQuery<{ items: Product[] }>({
    queryKey: ['products'],
    queryFn: () => api.get('/products'),
  });

  const { data: movementsData, isLoading } = useQuery<{ items: any[]; total: number }>({
    queryKey: ['inventory-movements'],
    queryFn: () => api.get('/inventory/movements'),
  });

  const adjustMutation = useMutation({
    mutationFn: () =>
      api.post('/inventory/adjustments', {
        productId: selectedProductId,
        quantityDelta: Number(deltaQty),
        reason,
      }),
    onSuccess: () => {
      setIsModalOpen(false);
      setSelectedProductId('');
      setDeltaQty(0);
      setReason('');
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });

  const getMovementBadge = (type: string, delta: number) => {
    switch (type) {
      case 'PURCHASE':
      case 'OPENING':
      case 'ADJUSTMENT_IN':
      case 'SALE_CANCEL':
        return <Badge variant="success">+{delta}</Badge>;
      case 'SALE':
      case 'ADJUSTMENT_OUT':
      case 'PURCHASE_CANCEL':
        return <Badge variant="overdue">{delta}</Badge>;
      default:
        return <Badge variant="neutral">{delta}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#123B3A]">Inventory Movements</h2>
          <p className="text-xs sm:text-sm text-[#566B69] mt-0.5">
            Traceable stock movement history across sales, purchases, and audited manual adjustments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Record Stock Adjustment</span>
          </Button>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white border border-[#D7E5E2] rounded-xl p-4 shadow-2xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#D7E5E2] text-[#566B69] font-semibold bg-[#F4F8F7]/50">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4 text-center">Movement Type</th>
                <th className="py-3 px-4 text-center">Change</th>
                <th className="py-3 px-4 text-center">Resulting Stock</th>
                <th className="py-3 px-4">Reason / Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D7E5E2]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#566B69]">
                    Loading stock movements...
                  </td>
                </tr>
              ) : movementsData?.items && movementsData.items.length > 0 ? (
                movementsData.items.map((m) => (
                  <tr key={m.id} className="hover:bg-[#F4F8F7]/60 transition-colors">
                    <td className="py-3.5 px-4 text-[#566B69]">
                      {new Date(m.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#123B3A]">{m.productName}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#0F766E]">{m.sku}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-semibold text-[#123B3A] text-[11px]">
                        {m.movementType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {getMovementBadge(m.movementType, m.quantityDelta)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-[#123B3A]">
                      {m.resultingStock} {m.unit}
                    </td>
                    <td className="py-3.5 px-4 text-[#566B69] italic max-w-xs truncate">
                      {m.reason || m.referenceType}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[#566B69]">
                    No stock movements recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Stock Adjustment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Manual Stock Adjustment"
        description="Audited adjustment for physical stock reconciliation, breakage, or damage"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#123B3A] mb-1">
              Select Product *
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#D7E5E2] rounded-lg text-[#123B3A] focus:outline-none focus:border-[#0F766E]"
            >
              <option value="">-- Choose product --</option>
              {products?.items.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — Available: {p.currentStock} {p.unit}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Quantity Delta (+ for Inward, - for Outward/Loss) *"
            type="number"
            value={deltaQty}
            onChange={(e) => setDeltaQty(parseInt(e.target.value, 10) || 0)}
            placeholder="e.g. +10 or -2"
            required
          />

          <Input
            label="Mandatory Reason for Adjustment *"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Physical inventory count discrepancy or damaged carton"
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              isLoading={adjustMutation.isPending}
              disabled={!selectedProductId || deltaQty === 0 || !reason.trim()}
              onClick={() => adjustMutation.mutate()}
            >
              Confirm Adjustment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
