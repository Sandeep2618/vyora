import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useCreateParty, useUpdateParty } from '@/hooks/useParties';
import { INDIAN_STATE_OPTIONS, getStateFromGstin } from '@/common/config/states';
import { PartyFormModalProps } from '../config/interface';
import { PHONE_LENGTH, GSTIN_LENGTH, PINCODE_LENGTH } from '../config/constant';
import { validateIndianPhone } from '../util';

export const PartyFormModal: React.FC<PartyFormModalProps> = ({
  isOpen,
  onClose,
  partyType,
  partyToEdit,
}) => {
  const { t } = useTranslation(['parties', 'common']);
  const isEditing = Boolean(partyToEdit);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  useEffect(() => {
    if (partyToEdit) {
      setName(partyToEdit.name);
      setPhone(partyToEdit.phone);
      setEmail(partyToEdit.email || '');
      setGstin(partyToEdit.gstin || '');
      setLine1(partyToEdit.billingAddress?.line1 || '');
      setCity(partyToEdit.billingAddress?.city || '');
      setState(partyToEdit.billingAddress?.state || '');
      setPincode(partyToEdit.billingAddress?.pincode || '');
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setGstin('');
      setLine1('');
      setCity('');
      setState('');
      setPincode('');
    }
  }, [partyToEdit, isOpen]);

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setGstin('');
    setLine1('');
    setCity('');
    setState('');
    setPincode('');
  };

  const createMutation = useCreateParty(() => {
    resetForm();
    onClose();
  });

  const updateMutation = useUpdateParty(() => {
    resetForm();
    onClose();
  });

  const handleGstinChange = (val: string) => {
    const upper = val.toUpperCase();
    setGstin(upper);
    const inferred = getStateFromGstin(upper);
    if (inferred) {
      setState(inferred.name);
    }
  };

  const isPhoneValid = validateIndianPhone(phone);
  const isFormValid = Boolean(
    name.trim() &&
    isPhoneValid &&
    line1.trim() &&
    city.trim() &&
    state.trim()
  );

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
  const label = partyType === 'CUSTOMER' ? t('tab.customers') : t('tab.suppliers');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `${t('actions.edit', { ns: 'common' })} ${label}` : `${t('actions.create', { ns: 'common' })} ${label}`}
      description={t('form.subtitle', { defaultValue: 'Enter contact details and billing address' })}
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose} className="w-full sm:w-auto">
            {t('actions.cancel', { ns: 'common' })}
          </Button>
          <Button
            type="submit"
            form="party-form"
            isLoading={isPending}
            disabled={!isFormValid}
            className="w-full sm:w-auto"
          >
            {t('actions.save', { ns: 'common' })}
          </Button>
        </>
      }
    >
      <form id="party-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('form.legalName', { defaultValue: 'Legal / Trade Name' })}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder={t('form.namePlaceholder', { defaultValue: 'e.g. Acme Enterprises' })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('form.phone', { defaultValue: 'Phone Number' })}
            type="tel"
            maxLength={PHONE_LENGTH}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            required
            placeholder={t('form.phonePlaceholder', { defaultValue: '9876543210' })}
            helperText={phone && !isPhoneValid ? t('form.phoneHelper', { defaultValue: 'Must be 10 digits starting with 6-9' }) : undefined}
            error={phone && !isPhoneValid ? t('form.phoneHelper', { defaultValue: 'Must be 10 digits starting with 6-9' }) : undefined}
          />

          <Input
            label={t('form.email', { defaultValue: 'Email Address' })}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('form.emailPlaceholder', { defaultValue: 'accounts@acme.in' })}
          />
        </div>

        <Input
          label={t('form.gstin', { defaultValue: 'GSTIN (15 Digits)' })}
          maxLength={GSTIN_LENGTH}
          value={gstin}
          onChange={(e) => handleGstinChange(e.target.value)}
          placeholder={t('form.gstinPlaceholder', { defaultValue: '27ABCDE1234F1Z5' })}
        />

        <div className="border-t border-[#D7E5E2] dark:border-[#1E3B38] pt-3">
          <p className="text-xs font-bold text-[#123B3A] dark:text-[#E6F4F1] mb-2">
            {t('form.billingAddress', { defaultValue: 'Billing Address' })}
          </p>
          <div className="space-y-3">
            <Input
              label={t('form.addressLine1', { defaultValue: 'Address Line 1' })}
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              required
              placeholder={t('form.addressPlaceholder', { defaultValue: 'Shop/Office No., Street, Area' })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label={t('form.city', { defaultValue: 'City' })}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                placeholder={t('form.cityPlaceholder', { defaultValue: 'Mumbai' })}
              />

              <Select
                label={t('form.state', { defaultValue: 'State / UT' })}
                value={state}
                onValueChange={(val) => setState(val)}
                options={INDIAN_STATE_OPTIONS}
                required
              />

              <Input
                label={t('form.pincode', { defaultValue: 'PIN Code' })}
                maxLength={PINCODE_LENGTH}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                placeholder={t('form.pincodePlaceholder', { defaultValue: '400001' })}
              />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};
