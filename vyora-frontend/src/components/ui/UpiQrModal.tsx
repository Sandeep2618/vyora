import React, { useState } from 'react';
import { QrCode, Copy, Check, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Modal } from './Modal';
import { Button } from './Button';
import { toast } from './Toast';
import { formatCurrency } from '@vyora/utils';

export interface UpiQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPayment?: () => Promise<void> | void;
  invoiceNumber: string;
  amountMinor: number;
  merchantName?: string;
  vpa?: string;
  isConfirming?: boolean;
}

export const UpiQrModal: React.FC<UpiQrModalProps> = ({
  isOpen,
  onClose,
  onConfirmPayment,
  invoiceNumber,
  amountMinor,
  merchantName,
  vpa,
  isConfirming = false,
}) => {
  const navigate = useNavigate();
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const cleanMerchant = merchantName?.trim() || 'Store';
  const cleanVpa = vpa?.trim() || '';
  const hasUpi = Boolean(cleanVpa);

  const amountRupees = (amountMinor / 100).toFixed(2);
  const cleanRef = invoiceNumber.replace(/[^a-zA-Z0-9]/g, '') || `INV${Date.now().toString().slice(-6)}`;
  const upiString = hasUpi
    ? `upi://pay?pa=${encodeURIComponent(cleanVpa)}&pn=${encodeURIComponent(
        cleanMerchant
      )}&am=${amountRupees}&cu=INR&tr=${encodeURIComponent(cleanRef)}&tn=${encodeURIComponent(
        `Bill ${invoiceNumber}`
      )}`
    : '';

  const qrUrl = hasUpi
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiString)}`
    : '';

  const handleCopyUpi = async () => {
    if (!cleanVpa) return;
    try {
      await navigator.clipboard.writeText(cleanVpa);
      setCopiedUpi(true);
      toast.success('UPI ID Copied', cleanVpa);
      setTimeout(() => setCopiedUpi(false), 2000);
    } catch {
      toast.error('Copy Failed', 'Could not copy UPI ID to clipboard');
    }
  };

  const handleCopyLink = async () => {
    if (!upiString) return;
    try {
      await navigator.clipboard.writeText(upiString);
      setCopiedLink(true);
      toast.success('Payment Link Copied', 'UPI intent URL copied to clipboard');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error('Copy Failed', 'Could not copy payment link');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Counter UPI QR Payment"
      description={`Customer can scan with PhonePe, GPay, Paytm, or BHIM for #${invoiceNumber}`}
      maxWidth="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isConfirming}>
            Cancel
          </Button>
          {onConfirmPayment && (
            <Button
              variant="primary"
              isLoading={isConfirming}
              onClick={onConfirmPayment}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Confirm Payment Received
            </Button>
          )}
        </>
      }
    >
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Amount Badge */}
        <div className="w-full bg-[#E6F4F2] dark:bg-[#132A29] border border-[#B3DDD7] dark:border-[#1E3B38] py-2.5 px-4 rounded-xl">
          <p className="text-[11px] font-semibold text-[#566B69] dark:text-[#8FA8A4] uppercase tracking-wider">
            Total Payable Amount
          </p>
          <p className="text-2xl font-black text-[#123B3A] dark:text-[#F0FDFA]">
            {formatCurrency(amountMinor)}
          </p>
        </div>

        {!hasUpi ? (
          <div className="w-full p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-left space-y-2">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>No UPI ID Configured</span>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Your business does not have a registered UPI ID for QR code collection. Add your UPI ID in Business Settings to start accepting instant counter payments.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                navigate('/settings');
              }}
              className="w-full mt-2 text-xs"
            >
              Configure UPI ID in Settings
            </Button>
          </div>
        ) : (
          <>
            {/* Scannable Dynamic QR Code Container */}
            <div className="relative p-3 bg-white rounded-2xl border-2 border-[#D7E5E2] shadow-md flex items-center justify-center">
              <img
                src={qrUrl}
                alt="UPI QR Code"
                className="w-52 h-52 object-contain"
                loading="eager"
              />
            </div>

            {/* Merchant Details & UPI ID */}
            <div className="w-full space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 px-3 bg-[#F4F8F7] dark:bg-[#142B2A] rounded-lg border border-[#D7E5E2] dark:border-[#1E3B38]">
                <span className="text-[#566B69] dark:text-[#8FA8A4]">Store Name:</span>
                <span className="font-bold text-[#123B3A] dark:text-[#F0FDFA] truncate max-w-[180px]">
                  {cleanMerchant}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 px-3 bg-[#F4F8F7] dark:bg-[#142B2A] rounded-lg border border-[#D7E5E2] dark:border-[#1E3B38]">
                <span className="text-[#566B69] dark:text-[#8FA8A4]">UPI ID:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-[#123B3A] dark:text-[#F0FDFA] text-[11px]">
                    {cleanVpa}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors text-[#566B69] dark:text-[#8FA8A4] hover:text-[#0F766E] dark:hover:text-[#14B8A6]"
                    title="Copy UPI ID"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full py-1.5 text-[11px] text-[#0F766E] dark:text-[#14B8A6] hover:underline flex items-center justify-center gap-1 font-medium cursor-pointer"
              >
                <ExternalLink className="w-3 h-3" />
                <span>{copiedLink ? 'Link Copied!' : 'Copy Direct UPI Payment Link'}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
