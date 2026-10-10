import React from 'react';
import { Card } from '../../components/ui/Card';
import { formatCurrency } from '../../utils';

interface CategoryBreakdown {
  categoryName: string;
  percentage: number;
}

interface SalesByCategoryProps {
  categories?: CategoryBreakdown[];
  totalSalesMinor?: number;
}

const CATEGORY_COLORS = ['#0F766E', '#123B3A', '#15803D', '#A16207'];

export const SalesByCategory: React.FC<SalesByCategoryProps> = ({
  categories,
  totalSalesMinor = 0,
}) => {
  return (
    <Card className="p-5 flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-bold text-[#123B3A]">Sales by Category</h3>
        <p className="text-xs text-[#566B69]">Product category distribution</p>

        <div className="mt-6 flex justify-center items-center">
          <div className="w-36 h-36 rounded-full border-8 border-[#0F766E] border-t-[#123B3A] border-r-[#15803D] border-l-[#A16207] flex flex-col items-center justify-center p-2 text-center bg-[#F4F8F7]/30">
            <span className="text-[10px] text-[#566B69] font-semibold">Total Sales</span>
            <span className="text-xs font-bold text-[#123B3A] mt-0.5">
              {formatCurrency(totalSalesMinor)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-2.5">
        {categories?.map((cat, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
              />
              <span className="text-[#123B3A] font-medium">{cat.categoryName}</span>
            </div>
            <span className="text-[#566B69] font-semibold">{cat.percentage}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
};
