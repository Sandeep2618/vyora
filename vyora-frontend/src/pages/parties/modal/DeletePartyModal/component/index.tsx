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
      title={t('deleteModal.title', { defaultValue: 'Delete Account' })}
      description={t('deleteModal.confirm', { name: party.name, defaultValue: `Are you sure you want to delete ${party.name}?` })}
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
        {t('deleteModal.warning', {
          name: party.name,
          defaultValue: `This action cannot be undone. All linked contact information and historical records for ${party.name} will be permanently removed.`,
        })}
      </p>
    </Modal>
  );
};
