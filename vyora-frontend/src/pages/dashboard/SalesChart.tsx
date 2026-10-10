import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, Plus } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils';

interface SalesTrendPoint {
  date: string;
  salesMinor: number;
}

interface SalesChartProps {
  salesTrend?: SalesTrendPoint[];
}

export const SalesChart: React.FC<SalesChartProps> = ({ salesTrend }) => {
  const navigate = useNavigate();
  const hasSales =
    salesTrend && salesTrend.length > 0 && salesTrend.some((t) => t.salesMinor > 0);
  const max = Math.max(...(salesTrend?.map((t) => t.salesMinor) || [100000]), 100000);

  return (
    <Card className="lg:col-span-2 p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-4 border-b border-[#D7E5E2]">
        <div>
          <h3 className="text-sm font-bold text-[#123B3A]">Sales Overview</h3>
          <p className="text-xs text-[#566B69]">Authoritative revenue across recorded sales</p>
        </div>
        <span className="text-xs text-[#566B69] bg-[#F4F8F7] px-2.5 py-1 rounded-md border border-[#D7E5E2]">
          Last 7 days
        </span>
      </div>

      {!hasSales ? (
        <div className="py-10 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-xl bg-[#E6F4F2] text-[#0F766E] flex items-center justify-center mb-3">
            <BarChart2 className="w-6 h-6 opacity-80" />
          </div>
          <h4 className="text-sm font-bold text-[#123B3A] mb-1">No sales recorded yet</h4>
          <p className="text-xs text-[#566B69] max-w-sm mb-4 leading-relaxed">
            Issue and finalize sales invoices to visualize your weekly sales trends and daily revenue.
          </p>
          <Button
            size="sm"
            onClick={() => navigate('/invoices/create')}
            className="flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Invoice</span>
          </Button>
        </div>
      ) : (
        <div className="mt-6 h-48 flex items-end gap-3 sm:gap-6 px-2">
          {salesTrend?.map((pt, idx) => {
            const heightPct = Math.max(12, Math.round((pt.salesMinor / max) * 100));

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-[#E6F4F2] rounded-t-lg relative flex items-end justify-center h-40">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full bg-[#0F766E] rounded-t-lg transition-all group-hover:bg-[#0D665F]"
                  />
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-[#123B3A] text-white text-[10px] py-1 px-2 rounded shadow-md pointer-events-none transition-opacity whitespace-nowrap">
                    {formatCurrency(pt.salesMinor)}
                  </div>
                </div>
                <span className="text-[10px] text-[#566B69] font-medium">
                  {pt.date.slice(5)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
