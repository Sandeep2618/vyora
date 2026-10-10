import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Trash2, Lightbulb, ArrowLeft } from 'lucide-react';
import { api } from '../../lib/api';
import { formatCurrency, majorToMinor, minorToMajor } from '@vyora/utils';
import { Party, Product, TaxRatePercent, Invoice, BusinessProfile } from '@vyora/shared-types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';

interface LineFormItem {
  productId: string;
  productName: string;
  sku: string;
  hsnCode?: string;
  quantity: number;
  rateMajor: number; // in Rupees for user entry
  discountPercent: number;
  taxRatePercent: TaxRatePercent;
}

export const CreateInvoicePage: React.FC = () => {
  const navigate = useNavigate();

  // Queries
  const { data: customers } = useQuery<{ items: Party[] }>({
    queryKey: ['parties', 'CUSTOMER'],
    queryFn: () => api.get('/parties?type=CUSTOMER'),
  });

  const { data: products } = useQuery<{ items: Product[] }>({
    queryKey: ['products'],
    queryFn: () => api.get('/products'),
  });

  const { data: business } = useQuery<BusinessProfile>({
    queryKey: ['business-current'],
    queryFn: () => api.get<BusinessProfile>('/business/current'),
  });

  // Form state
  const [customerId, setCustomerId] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 15');
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);

  // New Customer inline modal form state
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustCity, setNewCustCity] = useState('');
  const [newCustState, setNewCustState] = useState('Maharashtra');

  // Line items state
  const [lines, setLines] = useState<LineFormItem[]>([
    {
      productId: '',
      productName: '',
      sku: '',
      hsnCode: '',
      quantity: 1,
      rateMajor: 0,
      discountPercent: 0,
      taxRatePercent: 18,
    },
  ]);

  // Preview calculation from backend
  const [previewTotals, setPreviewTotals] = useState<any>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Auto-fill line item when product is chosen
  const handleProductSelect = (index: number, prodId: string) => {
    const selected = products?.items.find((p) => p.id === prodId);
    if (!selected) return;

    setLines((prev) => {
      const copy = [...prev];
      copy[index] = {
        productId: selected.id,
        productName: selected.name,
        sku: selected.sku,
        hsnCode: selected.hsnCode || '',
        quantity: copy[index]?.quantity || 1,
        rateMajor: minorToMajor(selected.sellingPriceMinor),
        discountPercent: copy[index]?.discountPercent || 0,
        taxRatePercent: selected.taxRatePercent,
      };
      return copy;
    });
  };

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      {
        productId: '',
        productName: '',
        sku: '',
        hsnCode: '',
        quantity: 1,
        rateMajor: 0,
        discountPercent: 0,
        taxRatePercent: 18,
      },
    ]);
  };

  const removeLine = (index: number) => {
    if (lines.length === 1) return;
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  // Authoritative live preview query
  useEffect(() => {
    const validLines = lines.filter((l) => l.productId && l.quantity > 0);
    if (!customerId || validLines.length === 0) {
      setPreviewTotals(null);
      setPreviewError(null);
      return;
    }

    const payload = {
      customerId,
      issueDate,
      dueDate,
      roundOff: true,
      items: validLines.map((l) => ({
        productId: l.productId,
        quantity: Number(l.quantity),
        unitPriceMinor: majorToMinor(Number(l.rateMajor)),
        discountPercent: Number(l.discountPercent),
        taxRatePercent: l.taxRatePercent,
      })),
    };

    api
      .post('/invoices/preview', payload)
      .then((res) => {
        setPreviewTotals(res);
        setPreviewError(null);
      })
      .catch((err) => {
        setPreviewError(err.message);
      });
  }, [customerId, lines, issueDate, dueDate]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: ({ finalize }: { finalize: boolean }) => {
      const validLines = lines.filter((l) => l.productId && l.quantity > 0);
      const payload = {
        customerId,
        issueDate,
        dueDate,
        notes,
        roundOff: true,
        items: validLines.map((l) => ({
          productId: l.productId,
          quantity: Number(l.quantity),
          unitPriceMinor: majorToMinor(Number(l.rateMajor)),
          discountPercent: Number(l.discountPercent),
          taxRatePercent: l.taxRatePercent,
        })),
      };
      return api.post<Invoice>(`/invoices?finalize=${finalize}`, payload);
    },
    onSuccess: (data: Invoice) => {
      navigate(`/invoices/${data.id}`);
    },
  });

  const addCustomerMutation = useMutation({
    mutationFn: () =>
      api.post<Party>('/parties', {
        type: 'CUSTOMER',
        name: newCustName,
        phone: newCustPhone,
        email: newCustEmail,
        billingAddress: {
          line1: newCustAddress || 'Default Address',
          city: newCustCity || 'Mumbai',
          state: newCustState,
          pincode: '400001',
        },
      }),
    onSuccess: (newParty: Party) => {
      setIsNewCustomerModalOpen(false);
      setCustomerId(newParty.id);
    },
  });

  const nextInvoicePreview = `${business?.invoicePrefix || 'INV-'}${String(
    business?.nextInvoiceNumber || 1,
  ).padStart(business?.invoiceNumberPadding || 4, '0')}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Bar with Draft & Finalize Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#D7E5E2]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/invoices')}
            className="p-1.5 rounded-lg text-[#566B69] hover:text-[#123B3A] hover:bg-white border border-[#D7E5E2] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#123B3A]">Create Invoice</h2>
            <p className="text-xs text-[#566B69]">Fill in the details below to issue a new bill</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            isLoading={createMutation.isPending}
            onClick={() => createMutation.mutate({ finalize: false })}
            disabled={!customerId || lines.every((l) => !l.productId)}
            className="flex-1 sm:flex-none justify-center"
          >
            Save Draft
          </Button>
          <Button
            isLoading={createMutation.isPending}
            onClick={() => createMutation.mutate({ finalize: true })}
            disabled={!customerId || lines.every((l) => !l.productId)}
            className="flex-1 sm:flex-none justify-center"
          >
            Create & Finalize
          </Button>
        </div>
      </div>

      {previewError && (
        <div className="p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-xl text-xs text-[#B91C1C]">
          {previewError}
        </div>
      )}

      {/* Main Grid: Left Details & Right Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Customer Details & Invoice Details & Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Invoice Details Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Details */}
            <div className="bg-white border border-[#D7E5E2] rounded-xl p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#123B3A]">Customer Details</h3>
                <button
                  type="button"
                  onClick={() => setIsNewCustomerModalOpen(true)}
                  className="text-xs font-semibold text-[#0F766E] hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Customer
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#123B3A] mb-1">
                  Select Customer <span className="text-[#B91C1C] font-bold">*</span>
                </label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D7E5E2] rounded-lg text-[#123B3A] focus:outline-none focus:border-[#0F766E]"
                >
                  <option value="">-- Choose a customer --</option>
                  {customers?.items.map((cust) => (
                    <option key={cust.id} value={cust.id}>
                      {cust.name} ({cust.phone})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="bg-white border border-[#D7E5E2] rounded-xl p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-[#123B3A]">Invoice Details</h3>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[#566B69] block text-[11px]">Invoice No.</span>
                  <span className="font-bold text-[#0F766E] bg-[#E6F4F2] px-2 py-1 rounded inline-block mt-0.5">
                    {nextInvoicePreview}
                  </span>
                </div>
                <div>
                  <span className="text-[#566B69] block text-[11px]">Issue Date</span>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full mt-0.5 px-2 py-1 bg-[#F4F8F7] border border-[#D7E5E2] rounded text-xs text-[#123B3A]"
                  />
                </div>
                <div>
                  <span className="text-[#566B69] block text-[11px]">Payment Terms</span>
                  <input
                    type="text"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full mt-0.5 px-2 py-1 bg-[#F4F8F7] border border-[#D7E5E2] rounded text-xs text-[#123B3A]"
                  />
                </div>
                <div>
                  <span className="text-[#566B69] block text-[11px]">Due Date</span>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full mt-0.5 px-2 py-1 bg-[#F4F8F7] border border-[#D7E5E2] rounded text-xs text-[#123B3A]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Add Items Table Card */}
          <div className="bg-white border border-[#D7E5E2] rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D7E5E2]">
              <h3 className="text-sm font-bold text-[#123B3A]">Add Items</h3>
              <Button size="sm" variant="outline" onClick={addLine}>
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </Button>
            </div>

            <div className="overflow-x-auto -mx-1 sm:mx-0">
              <table className="w-full text-left text-xs min-w-[650px] whitespace-nowrap">
                <thead>
                  <tr className="border-b border-[#D7E5E2] text-[#566B69] font-semibold bg-[#F4F8F7]/50">
                    <th className="py-2.5 px-2 w-8">#</th>
                    <th className="py-2.5 px-2 min-w-[160px]">Product / Service</th>
                    <th className="py-2.5 px-2 w-20">HSN/SAC</th>
                    <th className="py-2.5 px-2 w-20 text-center">Qty</th>
                    <th className="py-2.5 px-2 w-24 text-right">Rate (₹)</th>
                    <th className="py-2.5 px-2 w-24 text-right">Amount (₹)</th>
                    <th className="py-2.5 px-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D7E5E2]">
                  {lines.map((line, idx) => {
                    const lineTotal = line.quantity * line.rateMajor;
                    return (
                      <tr key={idx} className="hover:bg-[#F4F8F7]/40">
                        <td className="py-2 px-2 text-[#566B69] font-medium">{idx + 1}</td>
                        <td className="py-2 px-2">
                          <select
                            value={line.productId}
                            onChange={(e) => handleProductSelect(idx, e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-[#D7E5E2] rounded text-xs text-[#123B3A] focus:outline-none focus:border-[#0F766E]"
                          >
                            <option value="">Select item...</option>
                            {products?.items.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} (Stock: {p.currentStock} {p.unit})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={line.hsnCode || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setLines((prev) => {
                                const c = [...prev];
                                c[idx].hsnCode = val;
                                return c;
                              });
                            }}
                            className="w-full px-2 py-1 bg-[#F4F8F7] border border-[#D7E5E2] rounded text-xs"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="number"
                            min="1"
                            value={line.quantity}
                            onChange={(e) => {
                              const qty = Math.max(1, parseInt(e.target.value, 10) || 1);
                              setLines((prev) => {
                                const c = [...prev];
                                c[idx].quantity = qty;
                                return c;
                              });
                            }}
                            className="w-16 px-2 py-1 bg-white border border-[#D7E5E2] rounded text-xs text-center"
                          />
                        </td>
                        <td className="py-2 px-2 text-right">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.rateMajor}
                            onChange={(e) => {
                              const rate = parseFloat(e.target.value) || 0;
                              setLines((prev) => {
                                const c = [...prev];
                                c[idx].rateMajor = rate;
                                return c;
                              });
                            }}
                            className="w-20 px-2 py-1 bg-white border border-[#D7E5E2] rounded text-xs text-right"
                          />
                        </td>
                        <td className="py-2 px-2 text-right font-bold text-[#123B3A]">
                          {lineTotal.toFixed(2)}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeLine(idx)}
                            className="text-[#B91C1C] hover:opacity-75 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Button size="sm" variant="ghost" onClick={addLine} className="mt-2 text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Item
            </Button>
          </div>

          {/* Notes field */}
          <div className="bg-white border border-[#D7E5E2] rounded-xl p-5 shadow-2xs">
            <h3 className="text-xs font-bold text-[#123B3A] mb-2">Notes (Optional)</h3>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes, payment instructions, or terms for this invoice..."
              className="w-full p-3 text-xs bg-[#F4F8F7] border border-[#D7E5E2] rounded-lg text-[#123B3A] focus:outline-none focus:border-[#0F766E] focus:bg-white"
            />
          </div>
        </div>

        {/* Right Panel: Summary & Quick Tip */}
        <div className="space-y-6">
          {/* Summary Card as styled in Theme B mockup */}
          <div className="bg-white border border-[#D7E5E2] rounded-xl p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-[#123B3A] pb-2 border-b border-[#D7E5E2]">
              Summary
            </h3>

            <div className="space-y-2 text-xs text-[#566B69]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#123B3A]">
                  {formatCurrency(previewTotals?.subtotalMinor || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span className="font-semibold text-[#123B3A]">
                  {formatCurrency(previewTotals?.totalDiscountMinor || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>
                  {previewTotals?.isInterState ? 'IGST (18%)' : 'CGST + SGST (18%)'}
                </span>
                <span className="font-semibold text-[#123B3A]">
                  {formatCurrency(previewTotals?.totalTaxMinor || 0)}
                </span>
              </div>
              {previewTotals?.roundOffMinor !== 0 && (
                <div className="flex justify-between">
                  <span>Round Off</span>
                  <span className="font-semibold text-[#123B3A]">
                    {formatCurrency(previewTotals?.roundOffMinor || 0)}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#D7E5E2] flex items-center justify-between">
              <span className="text-sm font-bold text-[#123B3A]">Total Amount</span>
              <span className="text-xl font-black text-[#0F766E]">
                {formatCurrency(previewTotals?.grandTotalMinor || 0)}
              </span>
            </div>
          </div>

          {/* Quick Tip Box */}
          <div className="bg-[#E6F4F2] border border-[#D7E5E2] rounded-xl p-4 text-xs">
            <div className="flex items-center gap-2 text-[#0F766E] font-bold mb-1">
              <Lightbulb className="w-4 h-4" />
              <span>Quick Tip</span>
            </div>
            <p className="text-[#566B69] leading-relaxed">
              Finalizing an invoice assigns an irreversible sequential invoice number, atomically commits stock deductions, and updates client dues.
            </p>
          </div>
        </div>
      </div>

      {/* Add New Customer Modal */}
      <Modal
        isOpen={isNewCustomerModalOpen}
        onClose={() => setIsNewCustomerModalOpen(false)}
        title="Add New Customer"
        description="Quickly save customer contact and billing address"
      >
        <div className="space-y-4">
          <Input
            label="Customer Name"
            value={newCustName}
            onChange={(e) => setNewCustName(e.target.value)}
            placeholder="e.g. Acme Enterprises"
            required
          />
          <Input
            label="Phone Number"
            value={newCustPhone}
            onChange={(e) => setNewCustPhone(e.target.value)}
            placeholder="e.g. 9876543210"
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={newCustEmail}
            onChange={(e) => setNewCustEmail(e.target.value)}
            placeholder="e.g. info@acme.com"
          />
          <Input
            label="Billing Address"
            value={newCustAddress}
            onChange={(e) => setNewCustAddress(e.target.value)}
            placeholder="Street address"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input
              label="City"
              value={newCustCity}
              onChange={(e) => setNewCustCity(e.target.value)}
              placeholder="Mumbai"
            />
            <Input
              label="State"
              value={newCustState}
              onChange={(e) => setNewCustState(e.target.value)}
              placeholder="Maharashtra"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsNewCustomerModalOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              isLoading={addCustomerMutation.isPending}
              disabled={!newCustName.trim() || !newCustPhone.trim()}
              onClick={() => addCustomerMutation.mutate()}
              className="w-full sm:w-auto"
            >
              Save Customer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
