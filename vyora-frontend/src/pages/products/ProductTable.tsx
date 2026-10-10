import React from 'react';
import { Archive } from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency } from '../../utils';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  onArchive: (id: string) => void;
  onAddFirst: () => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  isLoading,
  onArchive,
  onAddFirst,
}) => {
  if (isLoading) {
    return (
      <div className="py-12 text-center text-xs text-[#566B69]">
        <div className="w-6 h-6 border-2 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading product catalog...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title="No products found"
        description="Add items to your catalog to start creating invoices and tracking inventory."
        actionLabel="Add Product"
        onAction={onAddFirst}
      />
    );
  }

  return (
    <div className="overflow-x-auto -mx-1 sm:mx-0">
      <table className="w-full text-left text-xs min-w-[680px] whitespace-nowrap">
        <thead>
          <tr className="border-b border-[#D7E5E2] text-[#566B69] font-semibold bg-[#F4F8F7]/50">
            <th className="py-3 px-4">Product / Item</th>
            <th className="py-3 px-4">SKU</th>
            <th className="py-3 px-4">HSN</th>
            <th className="py-3 px-4 text-right">Selling Price</th>
            <th className="py-3 px-4 text-center">Tax %</th>
            <th className="py-3 px-4 text-center">Current Stock</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#D7E5E2]">
          {products.map((prod) => {
            const isLow = prod.currentStock <= prod.reorderLevel;
            return (
              <tr key={prod.id} className="hover:bg-[#F4F8F7]/60 transition-colors">
                <td className="py-3.5 px-4 font-bold text-[#123B3A]">
                  {prod.name}
                  <span className="text-[10px] text-[#566B69] font-normal block">
                    Unit: {prod.unit}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-[#0F766E]">
                  {prod.sku}
                </td>
                <td className="py-3.5 px-4 font-mono text-[#566B69]">
                  {prod.hsnCode || '-'}
                </td>
                <td className="py-3.5 px-4 text-right font-bold text-[#123B3A]">
                  {formatCurrency(prod.sellingPriceMinor)}
                </td>
                <td className="py-3.5 px-4 text-center font-medium">
                  {prod.taxRatePercent}%
                </td>
                <td className="py-3.5 px-4 text-center">
                  <div className="inline-flex items-center gap-1.5">
                    <span className={`font-bold ${isLow ? 'text-[#B91C1C]' : 'text-[#123B3A]'}`}>
                      {prod.currentStock} {prod.unit}
                    </span>
                    {isLow && (
                      <Badge variant="overdue" className="text-[9px] px-1 py-0">
                        Low
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => onArchive(prod.id)}
                    title="Archive product"
                    className="p-1.5 text-[#566B69] hover:text-[#B91C1C] hover:bg-[#FEE2E2] rounded-md transition-colors"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
