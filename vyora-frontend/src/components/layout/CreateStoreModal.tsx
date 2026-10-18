import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Store, Building2, MapPin, Hash, Phone, Mail, Check } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { toast } from '../ui/Toast';
import { useAuth } from '../../context/AuthContext';

interface CreateStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newStore: any) => void;
}

export const CreateStoreModal: React.FC<CreateStoreModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation('common');
  const { createStore } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [gstin, setGstin] = useState('');
  const [invoicePrefix, setInvoicePrefix] = useState('INV-');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Store Name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        addressLine1: addressLine1.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        pincode: pincode.trim() || undefined,
        gstin: gstin.trim().toUpperCase() || undefined,
        invoicePrefix: invoicePrefix.trim().toUpperCase() || 'INV-',
        currency: 'INR',
      };

      const newStore = await createStore(payload);
      toast.success(`Store "${payload.name}" created successfully!`);
      if (onSuccess) onSuccess(newStore);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create new store workspace.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Business Store">
      <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
        {/* Store Name */}
        <div>
          <label className="block text-xs font-semibold text-[#123B3A] dark:text-[#E6F4F1] mb-1.5">
            Store / Branch Name *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-[#566B69] dark:text-[#8FA8A4]">
              <Store className="w-4 h-4" />
            </span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Vyora Chembur Branch"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl text-[#123B3A] dark:text-[#F0FDFA] focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
            />
          </div>
        </div>

        {/* GSTIN & Invoice Prefix Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#123B3A] dark:text-[#E6F4F1] mb-1.5">
              GSTIN (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-[#566B69] dark:text-[#8FA8A4]">
                <Hash className="w-4 h-4" />
              </span>
              <input
                type="text"
                maxLength={15}
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                placeholder="27AAAAA0000A1Z5"
                className="w-full pl-9 pr-3 py-2 text-sm uppercase bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl text-[#123B3A] dark:text-[#F0FDFA] focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#123B3A] dark:text-[#E6F4F1] mb-1.5">
              Bill / Invoice Prefix
            </label>
            <input
              type="text"
              maxLength={8}
              value={invoicePrefix}
              onChange={(e) => setInvoicePrefix(e.target.value.toUpperCase())}
              placeholder="INV-"
              className="w-full px-3 py-2 text-sm uppercase bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl text-[#123B3A] dark:text-[#F0FDFA] focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
            />
          </div>
        </div>

        {/* Phone & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#123B3A] dark:text-[#E6F4F1] mb-1.5">
              Store Phone (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-[#566B69] dark:text-[#8FA8A4]">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl text-[#123B3A] dark:text-[#F0FDFA] focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#123B3A] dark:text-[#E6F4F1] mb-1.5">
              Store Email (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-[#566B69] dark:text-[#8FA8A4]">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="branch@vyora.in"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl text-[#123B3A] dark:text-[#F0FDFA] focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
              />
            </div>
          </div>
        </div>

        {/* City & State */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#123B3A] dark:text-[#E6F4F1] mb-1.5">
              City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g., Mumbai"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl text-[#123B3A] dark:text-[#F0FDFA] focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#123B3A] dark:text-[#E6F4F1] mb-1.5">
              State
            </label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="e.g., Maharashtra"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl text-[#123B3A] dark:text-[#F0FDFA] focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
            />
          </div>
        </div>

        {/* Address & Pincode */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#123B3A] dark:text-[#E6F4F1] mb-1.5">
              Address (Optional)
            </label>
            <input
              type="text"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="Shop 4, Market Road"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl text-[#123B3A] dark:text-[#F0FDFA] focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#123B3A] dark:text-[#E6F4F1] mb-1.5">
              Pincode
            </label>
            <input
              type="text"
              maxLength={6}
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="400071"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl text-[#123B3A] dark:text-[#F0FDFA] focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#D7E5E2] dark:border-[#1E3B38] flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t('actions.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <span>Creating Store...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Create & Switch</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
