import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Save } from 'lucide-react';
import { businessApi } from '@/api/business';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { toast } from '@/components/ui/Toast';
import { INDIAN_STATE_OPTIONS } from '@/common/config/states';
import {
  DEFAULT_INVOICE_PREFIX,
  DEFAULT_PURCHASE_PREFIX,
  DEFAULT_INVOICE_PADDING,
} from '../config/constant';

export const ProfileTab: React.FC = () => {
  const { business, refreshBusiness, isOwner } = useAuth();
  const { t } = useTranslation('account');

  const [name, setName] = useState(business?.name || '');
  const [legalName, setLegalName] = useState(business?.legalName || '');
  const [phone, setPhone] = useState(business?.phone || '');
  const [email, setEmail] = useState(business?.email || '');
  const [gstin, setGstin] = useState(business?.gstin || '');
  const [pan, setPan] = useState(business?.pan || '');
  const [addressLine1, setAddressLine1] = useState(business?.addressLine1 || '');
  const [addressLine2, setAddressLine2] = useState(business?.addressLine2 || '');
  const [city, setCity] = useState(business?.city || '');
  const [state, setState] = useState(business?.state || '');
  const [pincode, setPincode] = useState(business?.pincode || '');
  const [invoicePrefix, setInvoicePrefix] = useState(business?.invoicePrefix || DEFAULT_INVOICE_PREFIX);
  const [invoicePadding, setInvoicePadding] = useState<number | string>(
    business?.invoiceNumberPadding || DEFAULT_INVOICE_PADDING,
  );
  const [purchasePrefix, setPurchasePrefix] = useState(business?.purchasePrefix || DEFAULT_PURCHASE_PREFIX);
  const [terms, setTerms] = useState(business?.termsAndConditions || '');

  useEffect(() => {
    if (business) {
      setName(business.name || '');
      setLegalName(business.legalName || '');
      setPhone(business.phone || '');
      setEmail(business.email || '');
      setGstin(business.gstin || '');
      setPan(business.pan || '');
      setAddressLine1(business.addressLine1 || '');
      setAddressLine2(business.addressLine2 || '');
      setCity(business.city || '');
      setState(business.state || '');
      setPincode(business.pincode || '');
      setInvoicePrefix(business.invoicePrefix || DEFAULT_INVOICE_PREFIX);
      setInvoicePadding(business.invoiceNumberPadding || DEFAULT_INVOICE_PADDING);
      setPurchasePrefix(business.purchasePrefix || DEFAULT_PURCHASE_PREFIX);
      setTerms(business.termsAndConditions || '');
    }
  }, [business]);

  const updateProfileMutation = useMutation({
    mutationFn: () =>
      businessApi.updateCurrent({
        name,
        legalName: legalName || undefined,
        phone,
        email,
        gstin: gstin || undefined,
        pan: pan || undefined,
        addressLine1,
        addressLine2: addressLine2 || undefined,
        city,
        state,
        pincode,
        invoicePrefix,
        invoiceNumberPadding: Number(invoicePadding) || DEFAULT_INVOICE_PADDING,
        purchasePrefix,
        termsAndConditions: terms || undefined,
      }),
    onSuccess: async () => {
      await refreshBusiness();
      toast.success(t('profile.savedSuccess', { defaultValue: 'Business and user profile saved successfully!' }));
    },
    onError: (err: any) => {
      toast.error(err?.message || t('profile.savedError', { defaultValue: 'Failed to update business profile' }));
    },
  });

  return (
    <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-b-2xl p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-[#D7E5E2] dark:border-[#1E3B38] pb-4">
        <div>
          <h2 className="text-base font-bold text-[#123B3A] dark:text-[#E6F4F1]">
            {t('profile.title', { defaultValue: 'Business Profile & Billing Settings' })}
          </h2>
          <p className="text-xs text-[#566B69] dark:text-slate-400 mt-0.5">
            {t('profile.subtitle', { defaultValue: 'Manage your legal tax identity, counter prefix, and default invoice terms.' })}
          </p>
        </div>
        {isOwner && (
          <Button
            variant="primary"
            size="sm"
            isLoading={updateProfileMutation.isPending}
            onClick={() => updateProfileMutation.mutate()}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{t('profile.saveBtn', { defaultValue: 'Save Profile Changes' })}</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          label={t('profile.businessName', { defaultValue: 'Business Name' })}
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Sharma Retail & Supplies"
          disabled={!isOwner}
        />

        <Input
          label={t('profile.legalName', { defaultValue: 'Legal Registered Name' })}
          value={legalName}
          onChange={(e) => setLegalName(e.target.value)}
          placeholder="e.g. Sharma Retail & Supplies Pvt. Ltd."
          disabled={!isOwner}
        />

        <Input
          label={t('profile.phone', { defaultValue: 'Business Phone Number' })}
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. 9876543210"
          disabled={!isOwner}
        />

        <Input
          label={t('profile.email', { defaultValue: 'Contact Email Address' })}
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. billing@company.com"
          disabled={!isOwner}
        />

        <Input
          label={t('profile.gstin', { defaultValue: 'GSTIN (15 Digits)' })}
          value={gstin}
          onChange={(e) => setGstin(e.target.value.toUpperCase())}
          placeholder="e.g. 27AABCU9603R1ZM"
          disabled={!isOwner}
        />

        <Input
          label={t('profile.pan', { defaultValue: 'Permanent Account Number (PAN)' })}
          value={pan}
          onChange={(e) => setPan(e.target.value.toUpperCase())}
          placeholder="e.g. AABCU9603R"
          disabled={!isOwner}
        />
      </div>

      <div className="border-t border-[#D7E5E2] dark:border-[#1E3B38] pt-5">
        <h3 className="text-sm font-bold text-[#123B3A] dark:text-[#E6F4F1] mb-4">
          {t('profile.sequenceSection', { defaultValue: 'Counter Document & Sequence Defaults' })}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Input
            label={t('profile.invoicePrefix', { defaultValue: 'Sales Invoice Prefix' })}
            required
            value={invoicePrefix}
            onChange={(e) => setInvoicePrefix(e.target.value)}
            placeholder="INV-"
            disabled={!isOwner}
          />
          <Input
            label={t('profile.invoicePadding', { defaultValue: 'Invoice Number Digits (Padding)' })}
            type="number"
            value={invoicePadding}
            onChange={(e) => setInvoicePadding(e.target.value)}
            placeholder="4 (e.g. 0001)"
            disabled={!isOwner}
          />
          <Input
            label={t('profile.purchasePrefix', { defaultValue: 'Purchase Bill Prefix' })}
            required
            value={purchasePrefix}
            onChange={(e) => setPurchasePrefix(e.target.value)}
            placeholder="BILL-"
            disabled={!isOwner}
          />
        </div>
      </div>

      <div className="border-t border-[#D7E5E2] dark:border-[#1E3B38] pt-5">
        <h3 className="text-sm font-bold text-[#123B3A] dark:text-[#E6F4F1] mb-4">
          {t('profile.addressSection', { defaultValue: 'Official Registered Address' })}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label={t('profile.addressLine1', { defaultValue: 'Address Line 1' })}
            required
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            placeholder="e.g. Shop 14, Commercial Plaza"
            disabled={!isOwner}
          />
          <Input
            label={t('profile.addressLine2', { defaultValue: 'Address Line 2 (Optional)' })}
            value={addressLine2}
            onChange={(e) => setAddressLine2(e.target.value)}
            placeholder="e.g. Andheri East"
            disabled={!isOwner}
          />
          <Input
            label={t('profile.city', { defaultValue: 'City' })}
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Mumbai"
            disabled={!isOwner}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label={t('profile.state', { defaultValue: 'State / Union Territory' })}
              required
              value={state}
              onValueChange={setState}
              options={INDIAN_STATE_OPTIONS}
              disabled={!isOwner}
            />
            <Input
              label={t('profile.pincode', { defaultValue: 'PIN Code' })}
              required
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="e.g. 400069"
              disabled={!isOwner}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-[#D7E5E2] dark:border-[#1E3B38] pt-5">
        <h3 className="text-sm font-bold text-[#123B3A] dark:text-[#E6F4F1] mb-2">
          {t('profile.termsSection', { defaultValue: 'Default Invoice Terms & Conditions' })}
        </h3>
        <textarea
          rows={3}
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
          placeholder={t('profile.termsPlaceholder', { defaultValue: 'Enter terms printed on invoice footer...' })}
          disabled={!isOwner}
          className="w-full rounded-xl border border-[#D7E5E2] dark:border-[#1E3B38] bg-white dark:bg-[#0D1C1B] px-3.5 py-2.5 text-xs text-[#123B3A] dark:text-[#E6F4F1] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
        />
      </div>
    </div>
  );
};
