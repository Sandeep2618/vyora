import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { formatCurrency } from '../../utils';

interface TopProductItem {
  productId: string;
  productName: string;
  soldQuantity: number;
  revenueMinor: number;
}

interface TopProductsWidgetProps {
  products?: TopProductItem[];
}

export const TopProductsWidget: React.FC<TopProductsWidgetProps> = ({ products }) => {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between pb-4 border-b border-[#D7E5E2]">
        <div>
          <h3 className="text-sm font-bold text-[#123B3A]">Top Products</h3>
          <p className="text-xs text-[#566B69]">Best sellers by volume & revenue</p>
        </div>
        <Link
          to="/products"
          className="text-xs font-semibold text-[#0F766E] hover:underline flex items-center gap-1"
        >
          View all &rarr;
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#D7E5E2] text-[#566B69] font-semibold">
              <th className="py-2.5 px-2">Product</th>
              <th className="py-2.5 px-2 text-center">Sold</th>
              <th className="py-2.5 px-2 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D7E5E2]">
            {products && products.length > 0 ? (
              products.map((p) => (
                <tr key={p.productId} className="hover:bg-[#F4F8F7]/80 transition-colors">
                  <td className="py-3 px-2 font-medium text-[#123B3A] truncate max-w-[130px]">
                    {p.productName}
                  </td>
                  <td className="py-3 px-2 text-center font-semibold text-[#566B69]">
                    {p.soldQuantity}
                  </td>
                  <td className="py-3 px-2 font-bold text-[#123B3A] text-right">
                    {formatCurrency(p.revenueMinor)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="py-8 text-center text-[#566B69]">
                  No sales recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
