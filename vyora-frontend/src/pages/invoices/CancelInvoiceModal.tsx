import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Invoice } from '../../types';
import { useCancelInvoice } from '../../hooks/useInvoices';

interface CancelInvoiceModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export const CancelInvoiceModal: React.FC<CancelInvoiceModalProps> = ({
  invoice,
  onClose,
}) => {
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
      title="Cancel Invoice"
      description={`Cancel invoice ${invoice?.invoiceNumber}. This action is audited and reverses allocated stock and customer ledger balances.`}
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Back
          </Button>
          <Button
            variant="danger"
            disabled={!cancelReason.trim()}
            isLoading={cancelMutation.isPending}
            onClick={handleConfirm}
            className="w-full sm:w-auto"
          >
            Confirm Cancellation
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Reason for Cancellation"
          placeholder="e.g. Order cancelled by client or wrong billing details entered"
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          required
        />
      </div>
    </Modal>
  );
};
