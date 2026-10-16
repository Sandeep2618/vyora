import React from 'react';
import { ShieldAlert, Store, QrCode, Phone, Building2 } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { useAuth } from '../../context/AuthContext';

interface AccessDeniedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  requiredRole?: string;
  errorType?: string;
  onUpgrade?: () => void;
}

export const AccessDeniedModal: React.FC<AccessDeniedModalProps> = ({
  isOpen,
  onClose,
  title = 'Permission Restricted',
  message,
  requiredRole,
  errorType,
  onUpgrade,
}) => {
  const { role, isOwner, business } = useAuth();

  const roleLabel =
    role === 'OWNER'
      ? 'Business Owner'
      : role === 'ADMIN'
      ? 'Store Manager'
      : 'Billing Staff';

  const isPlanIssue = errorType === 'PlanLimitExceeded' || errorType === 'PlanExpired';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="p-6 text-center space-y-4">
        <div
          className={`w-14 h-14 mx-auto rounded-full border flex items-center justify-center ${
            isPlanIssue
              ? 'bg-purple-50 border-purple-200 text-purple-600 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300'
              : 'bg-[#FEF3C7] border-[#FDE68A] text-[#D97706]'
          }`}
        >
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-[#123B3A] dark:text-[#F0FDFA]">{title}</h3>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full bg-[#F4F8F7] dark:bg-[#142B2A] border border-[#B2DDD7] dark:border-[#1E4D49] text-xs font-semibold text-[#0F766E] dark:text-[#14B8A6]">
            <span>Active Role:</span>
            <span>{roleLabel}</span>
          </div>

          <p className="text-sm text-[#566B69] dark:text-[#8FA8A4] mt-3 leading-relaxed max-w-sm mx-auto">
            {message ||
              'Your current role does not have permission to access or modify this section. Please ask your business owner to adjust your staff rights in Vyora.'}
          </p>

          {requiredRole && (
            <p className="text-xs text-[#64748B] dark:text-[#8FA8A4] mt-2">
              Requires: <strong className="text-[#123B3A] dark:text-[#F0FDFA]">{requiredRole}</strong>
            </p>
          )}

          {/* If plan issue and not owner: show owner contact guide */}
          {isPlanIssue && !isOwner && (
            <div className="mt-4 p-3 bg-[#F4F8F7] dark:bg-[#142B2A] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl text-xs text-left max-w-sm mx-auto space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#0F766E] font-bold">
                <Building2 className="w-3.5 h-3.5" />
                <span>Contact Business Owner to Unlock</span>
              </div>
              <p className="text-[#566B69] dark:text-[#8FA8A4]">
                Only the store owner has authorization to purchase or renew the subscription plan.
              </p>
              <div className="pt-1 flex flex-col gap-0.5 text-[#123B3A] dark:text-[#F0FDFA]">
                <div>
                  Owner: <strong>{business?.ownerName || 'The Business Owner'}</strong>
                </div>
                {business?.ownerPhone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#0F766E]" />
                    <span>
                      Phone: <strong>{business.ownerPhone}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-2">
          {isPlanIssue && isOwner && onUpgrade && (
            <Button
              onClick={() => {
                onClose();
                onUpgrade();
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
            >
              <QrCode className="w-4 h-4" />
              <span>Renew / Upgrade via UPI</span>
            </Button>
          )}
          <Button
            onClick={onClose}
            variant={isPlanIssue && isOwner ? 'outline' : 'primary'}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Store className="w-4 h-4" />
            <span>Return to Counter</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};
