import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Party } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { toast } from '@/components/ui/Toast';
import { INDIAN_STATE_OPTIONS } from '@/common/config/states';
import { NewCustomerModalProps } from '../config/interface';

export const NewCustomerModal: React.FC<NewCustomerModalProps> = ({
  isOpen,
  onClose,
  onCustomerCreated,
}) => {
  const { t } = useTranslation(['invoices', 'common']);
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  const addCustomerMutation = useMutation({
    mutationFn: () =>
      api.post<Party>('/parties', {
        name,
        type: 'CUSTOMER',
        phone,
        email: email || undefined,
        address: address || undefined,
        city: city || undefined,
        state,
      }),
    onSuccess: (newParty) => {
      queryClient.invalidateQueries({ queryKey: ['parties', 'CUSTOMER'] });
      onCustomerCreated(newParty.id);
      onClose();
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setCity('');
      toast.success(t('newCustomerModal.successToast', { name: newParty.name, defaultValue: `Customer ${newParty.name} created!` }));
    },
    onError: (err: any) => {
      toast.error(err?.message || t('newCustomerModal.errorToast', { defaultValue: 'Failed to save customer' }));
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('newCustomerModal.title', { defaultValue: 'Add New Customer' })}
      description={t('newCustomerModal.description', { defaultValue: 'Quickly save customer contact and billing address' })}
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            {t('actions.cancel', { ns: 'common' })}
          </Button>
          <Button
            isLoading={addCustomerMutation.isPending}
            disabled={!name.trim() || !phone.trim() || !state.trim()}
            onClick={() => addCustomerMutation.mutate()}
            className="w-full sm:w-auto"
          >
            {t('newCustomerModal.save', { defaultValue: 'Save Customer' })}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label={t('newCustomerModal.name', { defaultValue: 'Customer Name' })}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('newCustomerModal.namePlaceholder', { defaultValue: 'e.g. Acme Enterprises' })}
          required
        />
        <Input
          label={t('newCustomerModal.phone', { defaultValue: 'Phone Number' })}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t('newCustomerModal.phonePlaceholder', { defaultValue: 'e.g. 9876543210' })}
          required
        />
        <Input
          label={t('newCustomerModal.email', { defaultValue: 'Email Address' })}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('newCustomerModal.emailPlaceholder', { defaultValue: 'e.g. acme@company.com' })}
        />
        <Input
          label={t('newCustomerModal.address', { defaultValue: 'Billing Address' })}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={t('newCustomerModal.addressPlaceholder', { defaultValue: 'e.g. 104, Trade Center' })}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t('newCustomerModal.city', { defaultValue: 'City' })}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={t('newCustomerModal.cityPlaceholder', { defaultValue: 'e.g. Mumbai' })}
          />
          <Select
            label={t('newCustomerModal.state', { defaultValue: 'State / Union Territory' })}
            value={state}
            onValueChange={setState}
            options={INDIAN_STATE_OPTIONS}
            required
          />
        </div>
      </div>
    </Modal>
  );
};
