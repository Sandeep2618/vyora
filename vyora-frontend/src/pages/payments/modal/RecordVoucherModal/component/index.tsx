import React from 'react';
import { useTranslation } from 'react-i18next';
import { PaymentMethod } from '@vyora/shared-types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { RecordVoucherModalProps } from '../config/interface';

export const RecordVoucherModal: React.FC<RecordVoucherModalProps> = ({
  isOpen,
  onClose,
  type,
  onTypeChange,
  partyId,
  onPartyIdChange,
  partyOptions,
  amountMajor,
  onAmountChange,
  paymentMethod,
  onPaymentMethodChange,
  paymentDate,
  onPaymentDateChange,
  referenceNumber,
  onReferenceNumberChange,
  notes,
  onNotesChange,
  onSubmit,
  isSubmitting,
}) => {
  const { t } = useTranslation(['payments', 'common']);

  const paymentMethodOptions = [
    { label: t('recordModal.methods.bankTransfer', { defaultValue: 'Bank Transfer (NEFT/RTGS/IMPS)' }), value: 'BANK_TRANSFER' },
    { label: t('recordModal.methods.upi', { defaultValue: 'UPI' }), value: 'UPI' },
    { label: t('recordModal.methods.cash', { defaultValue: 'Cash' }), value: 'CASH' },
    { label: t('recordModal.methods.cheque', { defaultValue: 'Cheque' }), value: 'CHEQUE' },
    { label: t('recordModal.methods.card', { defaultValue: 'Debit / Credit Card' }), value: 'CARD' },
    { label: t('recordModal.methods.other', { defaultValue: 'Other' }), value: 'OTHER' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('recordModal.title', { defaultValue: 'Record Payment / Receipt Voucher' })}
      description={t('recordModal.description', { defaultValue: 'Idempotent ledger voucher with customer/supplier balance adjustment' })}
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            {t('actions.cancel', { ns: 'common' })}
          </Button>
          <Button
            isLoading={isSubmitting}
            disabled={!partyId || !amountMajor || Number(amountMajor) <= 0}
            onClick={onSubmit}
            className="w-full sm:w-auto"
          >
            {t('recordModal.confirm', { defaultValue: 'Confirm Voucher' })}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 bg-[#F4F8F7] dark:bg-[#0D1C1B] p-1 rounded-lg border border-[#D7E5E2] dark:border-[#1E3B38]">
          <button
            type="button"
            onClick={() => onTypeChange('RECEIPT')}
            className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-colors ${
              type === 'RECEIPT'
                ? 'bg-[#0F766E] text-white shadow-2xs'
                : 'text-[#566B69] dark:text-slate-400 hover:text-[#123B3A] dark:hover:text-slate-200'
            }`}
          >
            {t('recordModal.tabReceipt', { defaultValue: 'Receipt (From Customer)' })}
          </button>
          <button
            type="button"
            onClick={() => onTypeChange('PAYMENT')}
            className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-colors ${
              type === 'PAYMENT'
                ? 'bg-[#0F766E] text-white shadow-2xs'
                : 'text-[#566B69] dark:text-slate-400 hover:text-[#123B3A] dark:hover:text-slate-200'
            }`}
          >
            {t('recordModal.tabPayment', { defaultValue: 'Payment (To Supplier)' })}
          </button>
        </div>

        <Select
          label={type === 'RECEIPT' ? t('recordModal.selectCustomer', { defaultValue: 'Select Customer' }) : t('recordModal.selectSupplier', { defaultValue: 'Select Supplier' })}
          value={partyId}
          onValueChange={onPartyIdChange}
          options={partyOptions}
          required
        />

        <Input
          label={t('recordModal.amount', { defaultValue: 'Payment Amount (₹)' })}
          type="number"
          step="0.01"
          placeholder="0.00"
          value={amountMajor}
          onChange={(e) => onAmountChange(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label={t('recordModal.method', { defaultValue: 'Payment Method' })}
            value={paymentMethod}
            onValueChange={(val) => onPaymentMethodChange(val as PaymentMethod)}
            required
            options={paymentMethodOptions}
          />

          <DatePicker
            label={t('recordModal.date', { defaultValue: 'Payment Date' })}
            value={paymentDate}
            onChange={onPaymentDateChange}
            required
          />
        </div>

        <Input
          label={t('recordModal.reference', { defaultValue: 'Reference / UTR / Cheque No.' })}
          value={referenceNumber}
          onChange={(e) => onReferenceNumberChange(e.target.value)}
          placeholder={t('recordModal.referencePlaceholder', { defaultValue: 'e.g. UTR-98214812' })}
        />

        <Input
          label={t('recordModal.notes', { defaultValue: 'Notes (Optional)' })}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder={t('recordModal.notesPlaceholder', { defaultValue: 'e.g. Advance payment against order' })}
        />
      </div>
    </Modal>
  );
};
