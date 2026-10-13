import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { DeletePartyModalProps } from '../config/interface';

export const DeletePartyModal: React.FC<DeletePartyModalProps> = ({
  party,
  onClose,
  onConfirm,
  isLoading,
}) => {
  const { t } = useTranslation(['parties', 'common']);

  if (!party) return null;

  return (
    <Modal
      isOpen={Boolean(party)}
      onClose={onClose}
      title="Delete Account"
      description={`Are you sure you want to delete ${party.name}?`}
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose} className="w-full sm:w-auto">
            {t('actions.cancel', { ns: 'common' })}
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            isLoading={isLoading}
            className="w-full sm:w-auto"
          >
            {t('actions.delete', { ns: 'common' })}
          </Button>
        </>
      }
    >
      <p className="text-xs text-[#566B69] dark:text-[#8FA8A4] leading-relaxed">
        This action cannot be undone. All linked contact information and historical records for{' '}
        <strong className="text-[#123B3A] dark:text-[#E6F4F1]">{party.name}</strong> will be permanently removed.
      </p>
    </Modal>
  );
};
