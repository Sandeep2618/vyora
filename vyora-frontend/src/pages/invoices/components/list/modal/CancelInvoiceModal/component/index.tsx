import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCancelInvoice } from '@/hooks/useInvoices';
import { CancelInvoiceModalProps } from '../config/interface';

export const CancelInvoiceModal: React.FC<CancelInvoiceModalProps> = ({
  invoice,
  onClose,
}) => {
  const { t } = useTranslation(['invoices', 'common']);
  const [cancelReason, setCancelReason] = useState('');

  const cancelMutation = useCancelInvoice(() => {
    setCancelReason('');
    onClose();
  });

  const handleConfirm = () => {
    if (invoice && cancelReason.trim()) {
      cancelMutation.mutate({
        id: invoice.id,
        reason: cancelReason,
      });
    }
  };

  return (
    <Modal
      isOpen={!!invoice}
      onClose={onClose}
      title={t('cancelModal.title', { defaultValue: 'Cancel Invoice' })}
      description={t('cancelModal.description', {
        invoiceNumber: invoice?.invoiceNumber,
        defaultValue: `Cancel invoice ${invoice?.invoiceNumber}. This action is audited and reverses allocated stock and customer ledger balances.`,
      })}
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            {t('actions.cancel', { ns: 'common' })}
          </Button>
          <Button
            variant="danger"
            disabled={!cancelReason.trim()}
            isLoading={cancelMutation.isPending}
            onClick={handleConfirm}
            className="w-full sm:w-auto"
          >
            {t('cancelModal.confirm', { defaultValue: 'Confirm Cancellation' })}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label={t('cancelModal.reason', { defaultValue: 'Reason for Cancellation' })}
          placeholder={t('cancelModal.reasonPlaceholder', { defaultValue: 'e.g. Order cancelled by client or wrong billing details entered' })}
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          required
        />
      </div>
    </Modal>
  );
};
