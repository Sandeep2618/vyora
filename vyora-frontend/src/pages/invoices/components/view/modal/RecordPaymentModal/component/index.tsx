import React from 'react';
import { useTranslation } from 'react-i18next';
import { PaymentMethod } from '@/types';
import { formatCurrency, minorToMajor } from '@/utils';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { RecordPaymentModalProps } from '../config/interface';

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
  const { t } = useTranslation(['invoices', 'payments', 'common']);

  const paymentMethodOptions = [
    { label: t('recordModal.methods.bankTransfer', { ns: 'payments', defaultValue: 'Bank Transfer (NEFT/RTGS/IMPS)' }), value: 'BANK_TRANSFER' },
    { label: t('recordModal.methods.upi', { ns: 'payments', defaultValue: 'UPI' }), value: 'UPI' },
    { label: t('recordModal.methods.cash', { ns: 'payments', defaultValue: 'Cash' }), value: 'CASH' },
    { label: t('recordModal.methods.cheque', { ns: 'payments', defaultValue: 'Cheque' }), value: 'CHEQUE' },
    { label: t('recordModal.methods.card', { ns: 'payments', defaultValue: 'Debit / Credit Card' }), value: 'CARD' },
    { label: t('recordModal.methods.other', { ns: 'payments', defaultValue: 'Other' }), value: 'OTHER' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('recordPaymentModal.title', { defaultValue: 'Record Payment Receipt' })}
      description={t('recordPaymentModal.description', {
        invoiceNumber,
        due: formatCurrency(dueAmountMinor),
        defaultValue: `Record receipt against ${invoiceNumber}. Outstanding due: ${formatCurrency(dueAmountMinor)}`,
      })}
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            {t('actions.cancel', { ns: 'common' })}
          </Button>
          <Button
            isLoading={isSubmitting}
            disabled={!payAmountMajor || Number(payAmountMajor) <= 0}
            onClick={onSubmit}
            className="w-full sm:w-auto"
          >
            {t('recordPaymentModal.confirm', { defaultValue: 'Confirm Receipt Voucher' })}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label={t('recordPaymentModal.amount', { defaultValue: 'Payment Amount (₹)' })}
          type="number"
          step="0.01"
          placeholder="0.00"
          max={minorToMajor(dueAmountMinor)}
          value={payAmountMajor}
          onChange={(e) => onPayAmountChange(e.target.value)}
          required
        />

        <Select
          label={t('recordPaymentModal.method', { defaultValue: 'Payment Method' })}
          value={payMethod}
          onValueChange={(val) => onPayMethodChange(val as PaymentMethod)}
          options={paymentMethodOptions}
          required
        />

        <Input
          label={t('recordPaymentModal.ref', { defaultValue: 'Reference / Transaction ID' })}
          value={payRef}
          onChange={(e) => onPayRefChange(e.target.value)}
          placeholder={t('recordPaymentModal.refPlaceholder', { defaultValue: 'e.g. UTR12345678 / Cheque No.' })}
        />

        <Input
          label={t('recordPaymentModal.notes', { defaultValue: 'Notes' })}
          value={payNotes}
          onChange={(e) => onPayNotesChange(e.target.value)}
          placeholder={t('recordPaymentModal.notesPlaceholder', { defaultValue: 'Optional receipt notes' })}
        />
      </div>
    </Modal>
  );
};
