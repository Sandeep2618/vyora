import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Receipt, Calendar, CreditCard, Tag, User, FileText, Check } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { PaymentMethod } from '../../../types';
import { CreateExpensePayload } from '../../../api/expenses';
import { toast } from '../../../components/ui/Toast';

interface RecordExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (created: any) => void;
  onSubmit: (payload: CreateExpensePayload) => Promise<any>;
}

const QUICK_CATEGORIES = [
  'Tea & Refreshment',
  'Petrol & Fuel',
  'Rent',
  'Salary',
  'Transport & Freight',
  'Utilities & Electricity',
  'Maintenance & Repair',
  'Miscellaneous',
];

export const RecordExpenseModal: React.FC<RecordExpenseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onSubmit,
}) => {
  const { t } = useTranslation('common');
  const [category, setCategory] = useState<string>('Tea & Refreshment');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [expenseDate, setExpenseDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [vendorName, setVendorName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const selectedCategory = category === 'CUSTOM' ? customCategory.trim() : category;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Please enter a valid expense amount greater than 0.');
      return;
    }

    if (!selectedCategory) {
      toast.error('Please select or specify an expense category.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: CreateExpensePayload = {
        category: selectedCategory,
        amountMinor: Math.round(parsedAmount * 100),
        expenseDate: new Date(expenseDate).toISOString(),
        paymentMethod,
        vendorName: vendorName.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      const result = await onSubmit(payload);
      toast.success('Expense recorded successfully');
      onSuccess(result);
      onClose();
      // Reset form
      setAmount('');
      setVendorName('');
      setNotes('');
      setCategory('Tea & Refreshment');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to record expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Store Expense"
      description="Record petty cash, store rents, utility bills, logistics and operational costs"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t('actions.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            type="submit"
            form="record-expense-form"
            variant="primary"
            disabled={isSubmitting}
            className="flex items-center gap-1.5 shadow-sm"
          >
            {isSubmitting ? (
              <span>Saving...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Expense</span>
              </>
            )}
          </Button>
        </>
      }
    >
      <form id="record-expense-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Quick Category Chips */}
        <div>
          <label className="block text-xs font-semibold text-[#123B3A] dark:text-[#E6F4F1] mb-2 select-none">
            Expense Category <span className="text-[#B91C1C] dark:text-rose-400 font-bold">*</span>
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {QUICK_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setCategory(cat);
                  setCustomCategory('');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border cursor-pointer ${
                  category === cat
                    ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-2xs'
                    : 'bg-[#F4F8F7] dark:bg-[#142B2A] text-[#123B3A] dark:text-[#8FA8A4] border-[#D7E5E2] dark:border-[#1E3B38] hover:border-[#0F766E]'
                }`}
              >
                {cat}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCategory('CUSTOM')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border cursor-pointer ${
                category === 'CUSTOM'
                  ? 'bg-[#0F766E] text-white border-[#0F766E]'
                  : 'bg-[#F4F8F7] dark:bg-[#142B2A] text-[#123B3A] dark:text-[#8FA8A4] border-[#D7E5E2] dark:border-[#1E3B38]'
              }`}
            >
              + Other / Custom
            </button>
          </div>

          {category === 'CUSTOM' && (
            <input
              type="text"
              required
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="e.g., Office Stationery, Advertising..."
              className="w-full mt-1 px-3 py-2 text-sm bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl text-[#123B3A] dark:text-[#F0FDFA] focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
            />
          )}
        </div>

        {/* Amount & Date Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#123B3A] dark:text-[#E6F4F1] mb-1.5 select-none">
              Amount (₹) <span className="text-[#B91C1C] dark:text-rose-400 font-bold">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-bold text-[#566B69] dark:text-[#8FA8A4]">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-3 py-2 text-sm font-semibold bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl text-[#123B3A] dark:text-[#F0FDFA] focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#123B3A] dark:text-[#E6F4F1] mb-1.5 select-none">
              Date <span className="text-[#B91C1C] dark:text-rose-400 font-bold">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl text-[#123B3A] dark:text-[#F0FDFA] focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
              />
            </div>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div>
          <label className="block text-xs font-semibold text-[#123B3A] dark:text-[#E6F4F1] mb-1.5 select-none">
            Payment Mode <span className="text-[#B91C1C] dark:text-rose-400 font-bold">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE'] as PaymentMethod[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPaymentMethod(mode)}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                  paymentMethod === mode
                    ? 'bg-[#0F766E]/10 dark:bg-[#0F766E]/20 border-[#0F766E] text-[#0F766E] dark:text-[#14B8A6] shadow-2xs ring-1 ring-[#0F766E]'
                    : 'bg-white dark:bg-[#112322] border-[#D7E5E2] dark:border-[#1E3B38] text-[#566B69] dark:text-[#8FA8A4] hover:bg-[#F4F8F7]'
                }`}
              >
                {mode === 'BANK_TRANSFER' ? 'BANK' : mode}
              </button>
            ))}
          </div>
        </div>

        {/* Vendor / Paid To */}
        <div>
          <label className="block text-xs font-semibold text-[#123B3A] dark:text-[#E6F4F1] mb-1.5 select-none">
            Vendor / Paid To (Optional)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-[#566B69] dark:text-[#8FA8A4]">
              <User className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              placeholder="e.g., Sharma Tea Stall, Indian Oil"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl text-[#123B3A] dark:text-[#F0FDFA] focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
            />
          </div>
        </div>

        {/* Notes / Remarks */}
        <div>
          <label className="block text-xs font-semibold text-[#123B3A] dark:text-[#E6F4F1] mb-1.5 select-none">
            Notes / Remarks (Optional)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-[#566B69] dark:text-[#8FA8A4]">
              <FileText className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Monthly office tea bill, Delivery bike petrol"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl text-[#123B3A] dark:text-[#F0FDFA] focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};
