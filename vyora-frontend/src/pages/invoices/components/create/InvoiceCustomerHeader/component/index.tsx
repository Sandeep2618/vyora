import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { DatePicker } from '@/components/ui/DatePicker';
import { Select } from '@/components/ui/Select';
import { InvoiceCustomerHeaderProps } from '../config/interface';

export const InvoiceCustomerHeader: React.FC<InvoiceCustomerHeaderProps> = ({
  customers,
  selectedCustomerId,
  onCustomerChange,
  onAddNewCustomer,
  issueDate,
  onIssueDateChange,
  paymentTerms,
  onPaymentTermsChange,
  dueDate,
  onDueDateChange,
}) => {
  const { t } = useTranslation('invoices');
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const customerOptions = useMemo(
    () => [
      {
        label:
          customers.length === 0
            ? t('createPage.noCustomersFound', { defaultValue: 'No customers found — Click "+ New Customer"' })
            : t('createPage.selectCustomer', { defaultValue: 'Select a customer...' }),
        value: '',
      },
      ...customers.map((c) => ({
        label: `${c.name} ${c.phone ? `(${c.phone})` : ''}`,
        value: c.id,
      })),
    ],
    [customers, t]
  );

  return (
    <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl p-5 shadow-2xs space-y-4">
      {/* Customer Selection */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-[#123B3A] dark:text-[#E6F4F1]">
            {t('createPage.customer', { defaultValue: 'Customer' })} <span className="text-[#B91C1C]">*</span>
          </label>
          <button
            type="button"
            onClick={onAddNewCustomer}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F766E] dark:text-[#14B8A6] hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('createPage.newCustomer', { defaultValue: 'New Customer' })}</span>
          </button>
        </div>
        <Select
          value={selectedCustomerId}
          onValueChange={onCustomerChange}
          options={customerOptions}
          placeholder={t('createPage.selectCustomer', { defaultValue: 'Select a customer...' })}
        />
        {selectedCustomer && (
          <div className="mt-2.5 p-3 bg-[#F4F8F7] dark:bg-[#162E2D] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl text-xs space-y-1">
            <p className="font-bold text-[#123B3A] dark:text-[#E6F4F1]">{selectedCustomer.name}</p>
            {selectedCustomer.billingAddress?.line1 && (
              <p className="text-[11px] text-[#566B69] dark:text-slate-400">
                {selectedCustomer.billingAddress.line1}, {selectedCustomer.billingAddress.city || ''}
              </p>
            )}
            {selectedCustomer.gstin && (
              <p className="text-[11px] text-[#0F766E] dark:text-[#14B8A6] font-bold">GSTIN: {selectedCustomer.gstin}</p>
            )}
          </div>
        )}
      </div>

      {/* Invoice Date & Terms - 3 wide columns with zero truncation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#D7E5E2]/70 dark:border-[#1E3B38]/70">
        <DatePicker
          label={t('createPage.issueDate', { defaultValue: 'Issue Date' })}
          value={issueDate}
          onChange={onIssueDateChange}
          required
        />

        <div>
          <label className="text-xs font-semibold text-[#123B3A] dark:text-[#E6F4F1] block mb-1.5 select-none">
            {t('createPage.paymentTerms', { defaultValue: 'Payment Terms' })}
          </label>
          <input
            type="text"
            placeholder={t('createPage.paymentTermsPlaceholder', { defaultValue: 'e.g. Net 15' })}
            value={paymentTerms}
            onChange={(e) => onPaymentTermsChange(e.target.value)}
            className="w-full h-10 px-3 bg-white dark:bg-[#0D1C1B] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl text-xs font-semibold text-[#123B3A] dark:text-[#E6F4F1] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] dark:focus:border-[#14B8A6] transition-all"
          />
        </div>

        <DatePicker
          label={t('createPage.dueDate', { defaultValue: 'Due Date' })}
          value={dueDate}
          onChange={onDueDateChange}
          required
        />
      </div>
    </div>
  );
};
