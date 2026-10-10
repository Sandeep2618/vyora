import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { PartyType } from '../../types';
import { useCreateParty } from '../../hooks/useParties';

interface PartyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  partyType: PartyType;
}

export const PartyFormModal: React.FC<PartyFormModalProps> = ({
  isOpen,
  onClose,
  partyType,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('400001');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !line1.trim() || !city.trim()) return;

    createMutation.mutate({
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
    });
  };

  const label = partyType === 'CUSTOMER' ? 'Customer' : 'Supplier';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add ${label}`}
      description="Enter contact details and billing address"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 9820012345"
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

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={createMutation.isPending}
            disabled={!name.trim() || !phone.trim() || !line1.trim() || !city.trim()}
            className="w-full sm:w-auto"
          >
            Save Record
          </Button>
        </div>
      </form>
    </Modal>
  );
};
