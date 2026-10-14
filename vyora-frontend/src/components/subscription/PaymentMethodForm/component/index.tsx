import React from 'react';
import { useTranslation } from 'react-i18next';
import { QrCode, CreditCard, Building2, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@vyora/utils';
import { Select } from '@/components/ui/Select';
import { PaymentMethodFormProps } from '../config/interface';

export const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({
  paymentMethod,
  onPaymentMethodChange,
  selectedPlan,
  totalMinor,
  upiId,
  onUpiIdChange,
  cardNumber,
  onCardNumberChange,
  cardExpiry,
  onCardExpiryChange,
  cardCvv,
  onCardCvvChange,
  selectedBank,
  onSelectedBankChange,
}) => {
  const { t } = useTranslation('common');

  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold text-[#123B3A] dark:text-[#E6F4F1] uppercase tracking-wider">
        {t('planPurchaseModal.step2Method', { defaultValue: '2. Payment Method' })}
      </label>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onPaymentMethodChange('UPI')}
          className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
            paymentMethod === 'UPI'
              ? 'border-[#0F766E] bg-teal-50/50 dark:bg-teal-950/40 text-[#0F766E] dark:text-[#14B8A6] font-bold ring-1 ring-[#0F766E]'
              : 'border-[#D7E5E2] dark:border-[#1E3B38] text-[#566B69] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#162E2D]'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span className="text-xs">{t('planPurchaseModal.tabUpi', { defaultValue: 'UPI / QR' })}</span>
        </button>
        <button
          type="button"
          onClick={() => onPaymentMethodChange('CARD')}
          className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
            paymentMethod === 'CARD'
              ? 'border-[#0F766E] bg-teal-50/50 dark:bg-teal-950/40 text-[#0F766E] dark:text-[#14B8A6] font-bold ring-1 ring-[#0F766E]'
              : 'border-[#D7E5E2] dark:border-[#1E3B38] text-[#566B69] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#162E2D]'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span className="text-xs">{t('planPurchaseModal.tabCard', { defaultValue: 'Card' })}</span>
        </button>
        <button
          type="button"
          onClick={() => onPaymentMethodChange('NETBANKING')}
          className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
            paymentMethod === 'NETBANKING'
              ? 'border-[#0F766E] bg-teal-50/50 dark:bg-teal-950/40 text-[#0F766E] dark:text-[#14B8A6] font-bold ring-1 ring-[#0F766E]'
              : 'border-[#D7E5E2] dark:border-[#1E3B38] text-[#566B69] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#162E2D]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span className="text-xs">{t('planPurchaseModal.tabNetBanking', { defaultValue: 'Net Banking' })}</span>
        </button>
      </div>

      {/* Payment Details Sub-form */}
      <div className="p-3.5 bg-slate-50 dark:bg-[#0D1C1B] border border-slate-200 dark:border-[#1E3B38] rounded-xl space-y-3">
        {paymentMethod === 'UPI' && (
          <div className="space-y-3">
            <div className="bg-white dark:bg-[#112322] p-3.5 rounded-xl border border-[#D7E5E2] dark:border-[#1E3B38] flex flex-col items-center justify-center text-center">
              <p className="text-xs font-bold text-[#123B3A] dark:text-[#E6F4F1] mb-2">
                {t('planPurchaseModal.scanToPay', {
                  amount: formatCurrency(totalMinor),
                  defaultValue: `Scan with any UPI App to Pay ${formatCurrency(totalMinor)}`,
                })}
              </p>
              <div className="p-2 bg-white rounded-lg border border-[#D7E5E2] shadow-xs inline-block">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                    `upi://pay?pa=vyora.billing@icici&pn=Vyora%20Cloud&am=${(totalMinor / 100).toFixed(2)}&tr=VYORA-${selectedPlan.toUpperCase()}&cu=INR`
                  )}`}
                  alt="Vyora UPI QR Code"
                  className="w-36 h-36"
                />
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-[#566B69] dark:text-slate-400">
                <span>UPI VPA:</span>
                <span className="font-mono font-bold text-[#0F766E] dark:text-[#14B8A6] bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded text-[11px] border border-teal-200 dark:border-teal-800">
                  vyora.billing@icici
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#123B3A] dark:text-[#E6F4F1] mb-1">
                {t('planPurchaseModal.orEnterUpi', { defaultValue: 'Or Enter UPI ID / VPA for Collect Request' })}
              </label>
              <input
                type="text"
                placeholder="mobile@upi or yourname@okhdfcbank"
                value={upiId}
                onChange={(e) => onUpiIdChange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#D7E5E2] dark:border-[#1E3B38] bg-white dark:bg-[#112322] text-[#123B3A] dark:text-[#E6F4F1] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
              />
            </div>

            <div className="flex items-center justify-center gap-2 pt-0.5 text-[11px] text-[#566B69] dark:text-slate-400">
              <span className="bg-white dark:bg-[#112322] px-2 py-0.5 rounded border border-[#D7E5E2] dark:border-[#1E3B38]">Google Pay</span>
              <span className="bg-white dark:bg-[#112322] px-2 py-0.5 rounded border border-[#D7E5E2] dark:border-[#1E3B38]">PhonePe</span>
              <span className="bg-white dark:bg-[#112322] px-2 py-0.5 rounded border border-[#D7E5E2] dark:border-[#1E3B38]">Paytm</span>
              <span className="bg-white dark:bg-[#112322] px-2 py-0.5 rounded border border-[#D7E5E2] dark:border-[#1E3B38]">BHIM</span>
            </div>
          </div>
        )}

        {paymentMethod === 'CARD' && (
          <div className="space-y-2.5 text-xs">
            <div>
              <label className="block font-medium text-[#123B3A] dark:text-[#E6F4F1] mb-1">
                {t('planPurchaseModal.cardNumber', { defaultValue: 'Card Number' })}
              </label>
              <input
                type="text"
                maxLength={19}
                placeholder="4532 •••• •••• 8892"
                value={cardNumber}
                onChange={(e) => onCardNumberChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#D7E5E2] dark:border-[#1E3B38] bg-white dark:bg-[#112322] text-[#123B3A] dark:text-[#E6F4F1] font-mono focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-medium text-[#123B3A] dark:text-[#E6F4F1] mb-1">
                  {t('planPurchaseModal.validThru', { defaultValue: 'Valid Thru' })}
                </label>
                <input
                  type="text"
                  maxLength={5}
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={(e) => onCardExpiryChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#D7E5E2] dark:border-[#1E3B38] bg-white dark:bg-[#112322] text-[#123B3A] dark:text-[#E6F4F1] font-mono focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>
              <div>
                <label className="block font-medium text-[#123B3A] dark:text-[#E6F4F1] mb-1">
                  {t('planPurchaseModal.cvv', { defaultValue: 'CVV' })}
                </label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="•••"
                  value={cardCvv}
                  onChange={(e) => onCardCvvChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#D7E5E2] dark:border-[#1E3B38] bg-white dark:bg-[#112322] text-[#123B3A] dark:text-[#E6F4F1] font-mono focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>
            </div>
          </div>
        )}

        {paymentMethod === 'NETBANKING' && (
          <div className="space-y-2 text-xs">
            <Select
              label={t('planPurchaseModal.selectBank', { defaultValue: 'Select Bank' })}
              value={selectedBank}
              onValueChange={onSelectedBankChange}
              options={[
                { label: 'HDFC Bank', value: 'HDFC' },
                { label: 'State Bank of India', value: 'SBI' },
                { label: 'ICICI Bank', value: 'ICICI' },
                { label: 'Axis Bank', value: 'AXIS' },
                { label: 'Kotak Mahindra Bank', value: 'KOTAK' },
              ]}
            />
          </div>
        )}
      </div>

      {/* Security Footnote */}
      <div className="flex items-center justify-between text-[11px] text-[#566B69] dark:text-slate-400 pt-1">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
          <span>{t('planPurchaseModal.securityFootnote', { defaultValue: 'PCI-DSS Compliant • 256-Bit SSL Encryption' })}</span>
        </div>
        <span>{t('planPurchaseModal.billedInInr', { defaultValue: 'Billed in INR (₹)' })}</span>
      </div>
    </div>
  );
};
