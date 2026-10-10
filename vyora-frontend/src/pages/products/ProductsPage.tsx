import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, AlertTriangle, Package, Archive } from 'lucide-react';
import { api } from '../../lib/api';
import { formatCurrency, majorToMinor, minorToMajor } from '@vyora/utils';
import { Product, ItemUnit, TaxRatePercent } from '@vyora/shared-types';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

export const ProductsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [hsnCode, setHsnCode] = useState('');
  const [unit, setUnit] = useState<ItemUnit>('PCS');
  const [sellingRate, setSellingRate] = useState<number>(0);
  const [purchaseRate, setPurchaseRate] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<TaxRatePercent>(18);
  const [openingStock, setOpeningStock] = useState<number>(0);
  const [reorderLevel, setReorderLevel] = useState<number>(5);

  const { data, isLoading } = useQuery<{ items: Product[]; total: number }>({
    queryKey: ['products', search, lowStockOnly],
    queryFn: () => {
      const q = new URLSearchParams();
      if (search) q.set('search', search);
      if (lowStockOnly) q.set('lowStockOnly', 'true');
      return api.get(`/products?${q.toString()}`);
    },
  });

  const createMutation = useMutation({
    mutationFn: () =>
      api.post('/products', {
        name,
        sku,
        hsnCode: hsnCode || undefined,
        unit,
        sellingPriceMinor: majorToMinor(sellingRate),
        purchasePriceMinor: majorToMinor(purchaseRate),
        taxRatePercent: taxRate,
        openingStock: Number(openingStock),
        reorderLevel: Number(reorderLevel),
      }),
    onSuccess: () => {
      setIsModalOpen(false);
      setName('');
      setSku('');
      setHsnCode('');
      setSellingRate(0);
      setPurchaseRate(0);
      setOpeningStock(0);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#123B3A]">Products & Services</h2>
          <p className="text-xs sm:text-sm text-[#566B69] mt-0.5">
            Manage your inventory items, prices in minor precision, and GST tax brackets
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-[#D7E5E2] rounded-xl p-4 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLowStockOnly(!lowStockOnly)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                lowStockOnly
                  ? 'bg-[#FEF2F2] border-[#FECACA] text-[#B91C1C]'
                  : 'bg-[#F4F8F7] border-[#D7E5E2] text-[#566B69] hover:text-[#123B3A]'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Low Stock Alerts Only</span>
            </button>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#566B69]" />
            <input
              type="text"
              placeholder="Search product name, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F4F8F7] border border-[#D7E5E2] rounded-lg text-[#123B3A] focus:outline-none focus:border-[#0F766E] focus:bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
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
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#566B69]">
                    Loading catalog...
                  </td>
                </tr>
              ) : data?.items && data.items.length > 0 ? (
                data.items.map((prod) => {
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
                          <span
                            className={`font-bold ${
                              isLow ? 'text-[#B91C1C]' : 'text-[#123B3A]'
                            }`}
                          >
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
                          onClick={() => archiveMutation.mutate(prod.id)}
                          title="Archive product"
                          className="p-1.5 text-[#566B69] hover:text-[#B91C1C] hover:bg-[#FEE2E2] rounded-md transition-colors"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[#566B69]">
                    No products added yet. Click "Add Product" to create your first item.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Product / Service"
        description="Add a catalog item with pricing, tax rate, and opening inventory"
      >
        <div className="space-y-4">
          <Input
            label="Product Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Wireless Noise-Cancelling Earbuds"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="SKU Code *"
              value={sku}
              onChange={(e) => setSku(e.target.value.toUpperCase())}
              placeholder="e.g. EAR-001"
              required
            />
            <Input
              label="HSN / SAC Code"
              value={hsnCode}
              onChange={(e) => setHsnCode(e.target.value)}
              placeholder="e.g. 8517"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#123B3A] mb-1">
                Measurement Unit *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as ItemUnit)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#D7E5E2] rounded-lg text-[#123B3A] focus:outline-none focus:border-[#0F766E]"
              >
                <option value="PCS">PCS (Pieces)</option>
                <option value="BOX">BOX (Boxes)</option>
                <option value="KG">KG (Kilograms)</option>
                <option value="LTR">LTR (Liters)</option>
                <option value="MTR">MTR (Meters)</option>
                <option value="SET">SET (Sets)</option>
                <option value="PKT">PKT (Packets)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#123B3A] mb-1">
                GST Tax Rate *
              </label>
              <select
                value={taxRate}
                onChange={(e) => setTaxRate(parseInt(e.target.value, 10) as TaxRatePercent)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#D7E5E2] rounded-lg text-[#123B3A] focus:outline-none focus:border-[#0F766E]"
              >
                <option value={0}>0% (Exempt)</option>
                <option value={5}>5%</option>
                <option value={12}>12%</option>
                <option value={18}>18% (Standard)</option>
                <option value={28}>28%</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Selling Price (₹) *"
              type="number"
              step="0.01"
              value={sellingRate}
              onChange={(e) => setSellingRate(parseFloat(e.target.value) || 0)}
              required
            />
            <Input
              label="Purchase Cost Price (₹)"
              type="number"
              step="0.01"
              value={purchaseRate}
              onChange={(e) => setPurchaseRate(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Opening Stock Quantity"
              type="number"
              value={openingStock}
              onChange={(e) => setOpeningStock(parseInt(e.target.value, 10) || 0)}
            />
            <Input
              label="Reorder Alert Threshold"
              type="number"
              value={reorderLevel}
              onChange={(e) => setReorderLevel(parseInt(e.target.value, 10) || 0)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              isLoading={createMutation.isPending}
              disabled={!name.trim() || !sku.trim()}
              onClick={() => createMutation.mutate()}
            >
              Save Product
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
