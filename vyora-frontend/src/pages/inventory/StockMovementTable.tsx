import React from 'react';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';

export interface MovementItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  movementType: string;
  quantityDelta: number;
  resultingStock: number;
  reason?: string;
  referenceType?: string;
  createdAt: string;
}

interface StockMovementTableProps {
  movements: MovementItem[];
  isLoading: boolean;
  onOpenAdjustment: () => void;
}

export const StockMovementTable: React.FC<StockMovementTableProps> = ({
  movements,
  isLoading,
  onOpenAdjustment,
}) => {
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
        return <Badge variant="neutral">{delta > 0 ? `+${delta}` : delta}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center text-xs text-[#566B69]">
        <div className="w-6 h-6 border-2 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading stock movement history...
      </div>
    );
  }

  if (movements.length === 0) {
    return (
      <EmptyState
        title="No stock movements recorded"
        description="All sales, purchases, and manual adjustments create an immutable audit trail here."
        actionLabel="Record Adjustment"
        onAction={onOpenAdjustment}
      />
    );
  }

  return (
    <div className="overflow-x-auto -mx-1 sm:mx-0">
      <table className="w-full text-left text-xs min-w-[700px] whitespace-nowrap">
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
          {movements.map((m) => (
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
                {m.reason || m.referenceType || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
