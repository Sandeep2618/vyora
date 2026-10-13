import React from 'react';
import { PaymentMethod } from '@/types';
import { formatCurrency, minorToMajor } from '@/utils';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { RecordPaymentModalProps } from '../config/interface';
import { PAYMENT_METHOD_OPTIONS } from '../config/constant';

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  invoiceNumber,
  dueAmountMinor,
  payAmountMajor,
  onPayAmountChange,
  payMethod,
  onPayMethodChange,
  payRef,
  onPayRefChange,
  payNotes,
  onPayNotesChange,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Payment Receipt"
      description={`Record receipt against ${invoiceNumber}. Outstanding due: ${formatCurrency(dueAmountMinor)}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            isLoading={isSubmitting}
            disabled={!payAmountMajor || Number(payAmountMajor) <= 0}
            onClick={onSubmit}
            className="w-full sm:w-auto"
          >
            Confirm Receipt Voucher
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Payment Amount (₹)"
          type="number"
          step="0.01"
          placeholder="0.00"
          max={minorToMajor(dueAmountMinor)}
          value={payAmountMajor}
          onChange={(e) => onPayAmountChange(e.target.value)}
          required
        />

        <div>
          <label className="block text-xs font-semibold text-[#123B3A] dark:text-[#E6F4F1] mb-1">
            Payment Method <span className="text-[#B91C1C] font-bold">*</span>
          </label>
          <select
            value={payMethod}
            onChange={(e) => onPayMethodChange(e.target.value as PaymentMethod)}
            className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0D1C1B] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-lg text-[#123B3A] dark:text-[#E6F4F1] focus:outline-none focus:border-[#0F766E]"
          >
            {PAYMENT_METHOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Reference / Transaction ID"
          value={payRef}
          onChange={(e) => onPayRefChange(e.target.value)}
          placeholder="e.g. UTR12345678 / Cheque No."
        />

        <Input
          label="Notes"
          value={payNotes}
          onChange={(e) => onPayNotesChange(e.target.value)}
          placeholder="Optional receipt notes"
        />
      </div>
    </Modal>
  );
};
