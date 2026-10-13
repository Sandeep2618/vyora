import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { DeleteProductModalProps } from '../config/interface';

export const DeleteProductModal: React.FC<DeleteProductModalProps> = ({
  product,
  onClose,
  onConfirm,
  isLoading,
}) => {
  const { t } = useTranslation(['products', 'common']);

  if (!product) return null;

  return (
    <Modal
      isOpen={Boolean(product)}
      onClose={onClose}
      title="Delete Product"
      description={`Are you sure you want to delete ${product.name}?`}
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
        This action cannot be undone. Product{' '}
        <strong className="text-[#123B3A] dark:text-[#E6F4F1]">{product.name}</strong> will be removed from your active catalog. Past finalized invoices referencing this product will retain snapshot historical data.
      </p>
    </Modal>
  );
};
