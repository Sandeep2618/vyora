import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Party, PartyType } from '../../types';
import { useCreateParty, useUpdateParty } from '../../hooks/useParties';

interface PartyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  partyType: PartyType;
  partyToEdit?: Party | null;
}

export const PartyFormModal: React.FC<PartyFormModalProps> = ({
  isOpen,
  onClose,
  partyType,
  partyToEdit,
}) => {
  const isEditing = Boolean(partyToEdit);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('400001');

  useEffect(() => {
    if (partyToEdit) {
      setName(partyToEdit.name);
      setPhone(partyToEdit.phone);
      setEmail(partyToEdit.email || '');
      setGstin(partyToEdit.gstin || '');
      setLine1(partyToEdit.billingAddress?.line1 || '');
      setCity(partyToEdit.billingAddress?.city || '');
      setState(partyToEdit.billingAddress?.state || 'Maharashtra');
      setPincode(partyToEdit.billingAddress?.pincode || '400001');
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setGstin('');
      setLine1('');
      setCity('');
      setState('Maharashtra');
      setPincode('400001');
    }
  }, [partyToEdit, isOpen]);

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setGstin('');
    setLine1('');
    setCity('');
  };

  const createMutation = useCreateParty(() => {
    resetForm();
    onClose();
  });

  const updateMutation = useUpdateParty(() => {
    resetForm();
    onClose();
  });

  const isPhoneValid = phone.length === 10 && /^[6-9]/.test(phone);
  const isFormValid = Boolean(name.trim() && isPhoneValid && line1.trim() && city.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const payload = {
      type: partyType,
      name,
      phone,
      email: email || undefined,
      gstin: gstin || undefined,
      billingAddress: {
        line1,
        city,
        state,
        pincode,
      },
    };

    if (partyToEdit) {
      updateMutation.mutate({
        id: partyToEdit.id,
        data: payload,
      });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const label = partyType === 'CUSTOMER' ? 'Customer' : 'Supplier';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit ${label}` : `Add ${label}`}
      description={
        isEditing
          ? 'Update contact details and billing address'
          : 'Enter contact details and billing address'
      }
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            type="submit"
            form="party-form"
            isLoading={isPending}
            disabled={!isFormValid}
            className="w-full sm:w-auto"
          >
            {isEditing ? `Update ${label}` : 'Save Record'}
          </Button>
        </>
      }
    >
      <form id="party-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Legal / Trade Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Reliance Retail"
          required
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Phone Number"
            value={phone}
            maxLength={10}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
              setPhone(val);
            }}
            placeholder="e.g. 9820012345"
            helperText={phone && phone.length < 10 ? `Must be 10 digits (${phone.length}/10)` : undefined}
            error={phone && phone.length > 0 && !/^[6-9]/.test(phone) ? 'Must start with 6, 7, 8, or 9' : undefined}
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="billing@partner.com"
          />
        </div>
        <Input
          label="GSTIN (Optional)"
          value={gstin}
          onChange={(e) => setGstin(e.target.value.toUpperCase())}
          placeholder="27ABCDE1234F1Z5"
        />
        <Input
          label="Address Line 1"
          value={line1}
          onChange={(e) => setLine1(e.target.value)}
          placeholder="Street address / Shop No."
          required
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Input
            label="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Mumbai"
            required
          />
          <Input
            label="State"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="Maharashtra"
            required
          />
          <Input
            label="Pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            placeholder="400001"
            required
          />
        </div>
      </form>
    </Modal>
  );
};
