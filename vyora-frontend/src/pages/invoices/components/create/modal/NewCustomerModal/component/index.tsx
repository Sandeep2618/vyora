import React, { useState } from 'react';
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
      toast.success(`Customer ${newParty.name} created!`);
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to save customer');
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Customer"
      description="Quickly save customer contact and billing address"
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            isLoading={addCustomerMutation.isPending}
            disabled={!name.trim() || !phone.trim()}
            onClick={() => addCustomerMutation.mutate()}
            className="w-full sm:w-auto"
          >
            Save Customer
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Customer Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Acme Enterprises"
          required
        />
        <Input
          label="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. 9876543210"
          required
        />
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. acme@company.com"
        />
        <Input
          label="Billing Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="e.g. 104, Trade Center"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Mumbai"
          />
          <Select
            label="State / Union Territory"
            value={state}
            onValueChange={setState}
            options={INDIAN_STATE_OPTIONS}
          />
        </div>
      </div>
    </Modal>
  );
};
