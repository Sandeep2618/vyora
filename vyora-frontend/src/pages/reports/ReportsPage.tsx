import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Download, Calendar, Filter, FileText, ShoppingCart, Package, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';
import { formatCurrency, formatDateReadable } from '@vyora/utils';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';

export const ReportsPage: React.FC = () => {
  const { hasFeature, isOwner, updateSubscriptionPlan, plan } = useAuth();
  const [activeTab, setActiveTab] = useState<'SALES' | 'PURCHASES' | 'STOCK' | 'DUES'>('SALES');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 1. Sales Register Query
  const { data: salesData, isLoading: isSalesLoading } = useQuery<{ items: any[]; summary: any }>({
    queryKey: ['report-sales', startDate, endDate],
    queryFn: () => {
      const q = new URLSearchParams();
      if (startDate) q.set('startDate', startDate);
      if (endDate) q.set('endDate', endDate);
      return api.get(`/reports/sales-register?${q.toString()}`);
    },
    enabled: activeTab === 'SALES' && hasFeature('REPORTS'),
  });

  // 2. Purchase Register Query
  const { data: purchaseData, isLoading: isPurchaseLoading } = useQuery<{ items: any[]; summary: any }>({
    queryKey: ['report-purchases', startDate, endDate],
    queryFn: () => {
      const q = new URLSearchParams();
      if (startDate) q.set('startDate', startDate);
      if (endDate) q.set('endDate', endDate);
      return api.get(`/reports/purchase-register?${q.toString()}`);
    },
    enabled: activeTab === 'PURCHASES' && hasFeature('REPORTS'),
  });

  // 3. Stock Summary Query
  const { data: stockData, isLoading: isStockLoading } = useQuery<{ items: any[]; summary: any }>({
    queryKey: ['report-stock'],
    queryFn: () => api.get('/reports/stock-summary'),
    enabled: activeTab === 'STOCK' && hasFeature('REPORTS'),
  });

  // 4. Customer Dues Query
  const { data: duesData, isLoading: isDuesLoading } = useQuery<{ items: any[]; summary: any }>({
    queryKey: ['report-dues'],
    queryFn: () => api.get('/reports/customer-dues'),
    enabled: activeTab === 'DUES' && hasFeature('REPORTS'),
  });

  if (!hasFeature('REPORTS')) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-[#A0D2CA] text-[#0F766E] flex items-center justify-center mx-auto">
          <BarChart3 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#123B3A]">Business Reports require Growth Plan</h2>
        <p className="text-xs sm:text-sm text-[#566B69] max-w-md mx-auto">
          Sales Register, Purchase Register, Stock Inventory Valuation, and Debtor Aging are available on Growth (₹499/mo) and Business Pro (₹999/mo) plans.
        </p>
        {isOwner && (
          <Button onClick={() => updateSubscriptionPlan('growth')} className="mt-2">
            Upgrade to Growth Plan (₹499/mo)
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#123B3A]">Core Business Reports</h2>
          <p className="text-xs sm:text-sm text-[#566B69] mt-0.5">
            Authoritative registers, GST tax breakdowns, inventory valuation, and debtor aging
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.print()} className="no-print">
            <Download className="w-4 h-4 mr-1.5" />
            Print Report
          </Button>
        </div>
      </div>

      {/* Navigation Tabs and Date Range Filter */}
      <div className="bg-white border border-[#D7E5E2] rounded-xl p-4 shadow-2xs space-y-4 no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-[#F4F8F7] p-1 rounded-lg border border-[#D7E5E2] overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('SALES')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'SALES' ? 'bg-[#0F766E] text-white shadow-2xs' : 'text-[#566B69]'
              }`}
            >
              Sales Register
            </button>
            <button
              onClick={() => setActiveTab('PURCHASES')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'PURCHASES' ? 'bg-[#0F766E] text-white shadow-2xs' : 'text-[#566B69]'
              }`}
            >
              Purchase Register
            </button>
            <button
              onClick={() => setActiveTab('STOCK')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'STOCK' ? 'bg-[#0F766E] text-white shadow-2xs' : 'text-[#566B69]'
              }`}
            >
              Stock Summary & Valuation
            </button>
            <button
              onClick={() => setActiveTab('DUES')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'DUES' ? 'bg-[#0F766E] text-white shadow-2xs' : 'text-[#566B69]'
              }`}
            >
              Customer Dues (Receivables)
            </button>
          </div>

          {(activeTab === 'SALES' || activeTab === 'PURCHASES') && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#566B69] font-medium">Dates:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2 py-1 bg-[#F4F8F7] border border-[#D7E5E2] rounded text-xs text-[#123B3A]"
              />
              <span className="text-[#566B69]">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2 py-1 bg-[#F4F8F7] border border-[#D7E5E2] rounded text-xs text-[#123B3A]"
              />
            </div>
          )}
        </div>
      </div>

      {/* TAB 1: SALES REGISTER */}
      {activeTab === 'SALES' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-[#D7E5E2] rounded-xl p-4 shadow-2xs">
              <span className="text-xs text-[#566B69] font-semibold">Total Invoices</span>
              <h3 className="text-xl font-bold text-[#123B3A] mt-1">
                {salesData?.summary?.totalInvoices || 0}
              </h3>
            </div>
            <div className="bg-white border border-[#D7E5E2] rounded-xl p-4 shadow-2xs">
              <span className="text-xs text-[#566B69] font-semibold">Total Taxable</span>
              <h3 className="text-xl font-bold text-[#123B3A] mt-1">
                {formatCurrency(salesData?.summary?.totalTaxableMinor || 0)}
              </h3>
            </div>
            <div className="bg-white border border-[#D7E5E2] rounded-xl p-4 shadow-2xs">
              <span className="text-xs text-[#566B69] font-semibold">Total Tax (GST)</span>
              <h3 className="text-xl font-bold text-[#123B3A] mt-1">
                {formatCurrency(salesData?.summary?.totalTaxMinor || 0)}
              </h3>
            </div>
            <div className="bg-white border border-[#D7E5E2] rounded-xl p-4 shadow-2xs">
              <span className="text-xs text-[#566B69] font-semibold">Net Sales</span>
              <h3 className="text-xl font-black text-[#0F766E] mt-1">
                {formatCurrency(salesData?.summary?.totalGrandMinor || 0)}
              </h3>
            </div>
          </div>

          <div className="bg-white border border-[#D7E5E2] rounded-xl p-4 shadow-2xs overflow-x-auto -mx-1 sm:mx-0">
            <table className="w-full text-left text-xs min-w-[750px] whitespace-nowrap">
              <thead>
                <tr className="border-b border-[#D7E5E2] text-[#566B69] font-semibold bg-[#F4F8F7]/50">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Invoice No.</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3 text-right">Taxable</th>
                  <th className="py-3 px-3 text-right">CGST</th>
                  <th className="py-3 px-3 text-right">SGST</th>
                  <th className="py-3 px-3 text-right">IGST</th>
                  <th className="py-3 px-3 text-right">Total Amount</th>
                  <th className="py-3 px-3 text-right">Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D7E5E2]">
                {salesData?.items && salesData.items.length > 0 ? (
                  salesData.items.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#F4F8F7]/60">
                      <td className="py-3 px-3 text-[#566B69]">{formatDateReadable(inv.issueDate)}</td>
                      <td className="py-3 px-3 font-mono font-bold text-[#0F766E]">{inv.invoiceNumber}</td>
                      <td className="py-3 px-3 font-medium text-[#123B3A]">{inv.customerName}</td>
                      <td className="py-3 px-3 text-right font-medium">{formatCurrency(inv.taxableMinor)}</td>
                      <td className="py-3 px-3 text-right text-[#566B69]">{formatCurrency(inv.cgstMinor)}</td>
                      <td className="py-3 px-3 text-right text-[#566B69]">{formatCurrency(inv.sgstMinor)}</td>
                      <td className="py-3 px-3 text-right text-[#566B69]">{formatCurrency(inv.igstMinor)}</td>
                      <td className="py-3 px-3 text-right font-bold text-[#123B3A]">
                        {formatCurrency(inv.grandTotalMinor)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-[#B91C1C]">
                        {formatCurrency(inv.dueMinor)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-6">
                      <EmptyState
                        icon={FileText}
                        title="No sales invoices in this period"
                        description="Invoices finalized within the selected date range will appear in this tax register."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PURCHASE REGISTER */}
      {activeTab === 'PURCHASES' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#D7E5E2] rounded-xl p-4 shadow-2xs overflow-x-auto -mx-1 sm:mx-0">
            <table className="w-full text-left text-xs min-w-[650px] whitespace-nowrap">
              <thead>
                <tr className="border-b border-[#D7E5E2] text-[#566B69] font-semibold bg-[#F4F8F7]/50">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Bill No.</th>
                  <th className="py-3 px-3">Supplier</th>
                  <th className="py-3 px-3 text-right">Subtotal</th>
                  <th className="py-3 px-3 text-right">Taxes</th>
                  <th className="py-3 px-3 text-right">Grand Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D7E5E2]">
                {purchaseData?.items && purchaseData.items.length > 0 ? (
                  purchaseData.items.map((p) => (
                    <tr key={p.id} className="hover:bg-[#F4F8F7]/60">
                      <td className="py-3 px-3 text-[#566B69]">{formatDateReadable(p.billDate)}</td>
                      <td className="py-3 px-3 font-mono font-bold text-[#0F766E]">{p.billNumber}</td>
                      <td className="py-3 px-3 font-medium text-[#123B3A]">{p.supplierName}</td>
                      <td className="py-3 px-3 text-right font-medium">{formatCurrency(p.subtotalMinor)}</td>
                      <td className="py-3 px-3 text-right text-[#566B69]">{formatCurrency(p.totalTaxMinor)}</td>
                      <td className="py-3 px-3 text-right font-black text-[#123B3A]">
                        {formatCurrency(p.grandTotalMinor)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6">
                      <EmptyState
                        icon={ShoppingCart}
                        title="No purchase bills recorded in this period"
                        description="Vendor purchases recorded for the selected date range will appear in this purchase ledger."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: STOCK SUMMARY */}
      {activeTab === 'STOCK' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-[#D7E5E2] rounded-xl p-4 shadow-2xs">
              <span className="text-xs text-[#566B69] font-semibold">Total Stock Units</span>
              <h3 className="text-xl font-bold text-[#123B3A] mt-1">
                {stockData?.summary?.totalStockQty || 0}
              </h3>
            </div>
            <div className="bg-white border border-[#D7E5E2] rounded-xl p-4 shadow-2xs">
              <span className="text-xs text-[#566B69] font-semibold">Total Stock Valuation</span>
              <h3 className="text-xl font-black text-[#0F766E] mt-1">
                {formatCurrency(stockData?.summary?.totalValuationMinor || 0)}
              </h3>
            </div>
          </div>

          <div className="bg-white border border-[#D7E5E2] rounded-xl p-4 shadow-2xs overflow-x-auto -mx-1 sm:mx-0">
            <table className="w-full text-left text-xs min-w-[680px] whitespace-nowrap">
              <thead>
                <tr className="border-b border-[#D7E5E2] text-[#566B69] font-semibold bg-[#F4F8F7]/50">
                  <th className="py-3 px-3">Product Name</th>
                  <th className="py-3 px-3">SKU</th>
                  <th className="py-3 px-3 text-center">Unit</th>
                  <th className="py-3 px-3 text-center">Current Stock</th>
                  <th className="py-3 px-3 text-right">Cost Price</th>
                  <th className="py-3 px-3 text-right">Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D7E5E2]">
                {stockData?.items && stockData.items.length > 0 ? (
                  stockData.items.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F4F8F7]/60">
                      <td className="py-3 px-3 font-bold text-[#123B3A]">{item.name}</td>
                      <td className="py-3 px-3 font-mono font-bold text-[#0F766E]">{item.sku}</td>
                      <td className="py-3 px-3 text-center text-[#566B69]">{item.unit}</td>
                      <td className="py-3 px-3 text-center font-bold text-[#123B3A]">
                        {item.currentStock}
                      </td>
                      <td className="py-3 px-3 text-right font-medium">
                        {formatCurrency(item.purchasePriceMinor)}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-[#0F766E]">
                        {formatCurrency(item.valuationMinor)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6">
                      <EmptyState
                        icon={Package}
                        title="No products in catalog"
                        description="Add items to your product inventory to see unit counts and financial valuation."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CUSTOMER DUES */}
      {activeTab === 'DUES' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#D7E5E2] rounded-xl p-4 shadow-2xs">
            <span className="text-xs text-[#566B69] font-semibold">Total Outstanding Receivables</span>
            <h3 className="text-2xl font-black text-[#B91C1C] mt-1">
              {formatCurrency(duesData?.summary?.totalDueMinor || 0)}
            </h3>
          </div>

          <div className="bg-white border border-[#D7E5E2] rounded-xl p-4 shadow-2xs overflow-x-auto -mx-1 sm:mx-0">
            <table className="w-full text-left text-xs min-w-[500px] whitespace-nowrap">
              <thead>
                <tr className="border-b border-[#D7E5E2] text-[#566B69] font-semibold bg-[#F4F8F7]/50">
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4 text-right">Outstanding Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D7E5E2]">
                {duesData?.items && duesData.items.length > 0 ? (
                  duesData.items.map((c) => (
                    <tr key={c.id} className="hover:bg-[#F4F8F7]/60">
                      <td className="py-3.5 px-4 font-bold text-[#123B3A]">{c.name}</td>
                      <td className="py-3.5 px-4 text-[#566B69]">{c.phone}</td>
                      <td className="py-3.5 px-4 text-right font-black text-[#B91C1C]">
                        {formatCurrency(c.dueMinor)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-6">
                      <EmptyState
                        icon={CheckCircle2}
                        title="Zero outstanding customer dues!"
                        description="All customer invoices are settled or fully reconciled. No pending receivables."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
