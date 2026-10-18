import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, Store, QrCode, Phone, Building2, Clock, Sparkles } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { useAuth } from '../../context/AuthContext';

export interface AccessDeniedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  requiredRole?: string;
  requiredPlan?: string;
  type?: 'PLAN_RESTRICTION' | 'ROLE_RESTRICTION';
  errorType?: string;
  onUpgrade?: () => void;
  autoRedirectSeconds?: number;
}

export const AccessDeniedModal: React.FC<AccessDeniedModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  requiredRole,
  requiredPlan,
  type,
  errorType,
  onUpgrade,
  autoRedirectSeconds = 5,
}) => {
  const { role, isOwner, business } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const isPlanIssue =
    type === 'PLAN_RESTRICTION' ||
    errorType === 'PlanLimitExceeded' ||
    errorType === 'PlanExpired';

  const defaultTitle = isPlanIssue
    ? t('accessDenied.planUpgradeRequired', { defaultValue: 'Plan Upgrade Required' })
    : t('accessDenied.permissionRestricted', { defaultValue: 'Permission Restricted' });

  const modalTitle = title || defaultTitle;

  const roleLabel =
    role === 'OWNER'
      ? t('roles.owner', { defaultValue: 'Business Owner' })
      : role === 'ADMIN'
      ? t('roles.admin', { defaultValue: 'Store Manager' })
      : t('roles.staff', { defaultValue: 'Billing Staff' });

  const [secondsLeft, setSecondsLeft] = useState<number>(autoRedirectSeconds);

  // Active countdown timer for Plan Restrictions: auto-redirects to Billing section
  useEffect(() => {
    if (!isOpen || !isPlanIssue) {
      setSecondsLeft(autoRedirectSeconds);
      return;
    }

    setSecondsLeft(autoRedirectSeconds);

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          navigate('/account?tab=BILLING');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isPlanIssue, autoRedirectSeconds, navigate, onClose]);

  const handleGoToBilling = () => {
    onClose();
    if (onUpgrade && isOwner) {
      onUpgrade();
    } else {
      navigate('/account?tab=BILLING');
    }
  };

  const handleReturnToDashboard = () => {
    onClose();
    navigate('/');
  };

  return (
    <Modal isOpen={isOpen} onClose={handleReturnToDashboard} title={modalTitle}>
      <div className="p-6 text-center space-y-4">
        <div
          className={`w-14 h-14 mx-auto rounded-2xl border flex items-center justify-center shadow-xs transition-transform transform scale-100 ${
            isPlanIssue
              ? 'bg-purple-50 border-purple-200 text-purple-600 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300'
              : 'bg-[#FEF3C7] border-[#FDE68A] text-[#D97706]'
          }`}
        >
          {isPlanIssue ? <Sparkles className="w-7 h-7" /> : <ShieldAlert className="w-7 h-7" />}
        </div>

        <div>
          <h3 className="text-lg font-bold text-[#123B3A] dark:text-[#F0FDFA]">{modalTitle}</h3>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full bg-[#F4F8F7] dark:bg-[#142B2A] border border-[#B2DDD7] dark:border-[#1E4D49] text-xs font-semibold text-[#0F766E] dark:text-[#14B8A6]">
            <span>{t('accessDenied.activeRole', { defaultValue: 'Active Role:' })}</span>
            <span>{roleLabel}</span>
          </div>

          <p className="text-sm text-[#566B69] dark:text-[#8FA8A4] mt-3 leading-relaxed max-w-sm mx-auto">
            {message ||
              (isPlanIssue
                ? t(
                    'accessDenied.planMessage',
                    { defaultValue: 'This feature is available on Growth and Enterprise plans. Upgrade your subscription to unlock unlimited access.' }
                  )
                : t(
                    'accessDenied.roleMessage',
                    { defaultValue: 'Your current role does not have permission to access or modify this section. Please ask your business owner to adjust your staff rights in Vyora.' }
                  ))}
          </p>

          {requiredPlan && (
            <p className="text-xs text-[#64748B] dark:text-[#8FA8A4] mt-2 font-medium">
              Requires:{' '}
              <strong className="text-purple-700 dark:text-purple-300 uppercase tracking-wide">
                {requiredPlan} Plan
              </strong>
            </p>
          )}

          {requiredRole && !isPlanIssue && (
            <p className="text-xs text-[#64748B] dark:text-[#8FA8A4] mt-2">
              Requires: <strong className="text-[#123B3A] dark:text-[#F0FDFA]">{requiredRole}</strong>
            </p>
          )}

          {/* Countdown Indicator Banner for Plan Restrictions */}
          {isPlanIssue && (
            <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold shadow-2xs animate-pulse">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {t('accessDenied.redirecting', {
                  seconds: secondsLeft,
                  defaultValue: `Redirecting to Billing in ${secondsLeft}s...`,
                })}
              </span>
            </div>
          )}

          {/* If plan issue and not owner: show owner contact guide */}
          {isPlanIssue && !isOwner && (
            <div className="mt-4 p-3.5 bg-[#F4F8F7] dark:bg-[#142B2A] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl text-xs text-left max-w-sm mx-auto space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[#0F766E] font-bold">
                <Building2 className="w-3.5 h-3.5" />
                <span>{t('accessDenied.contactOwner', { defaultValue: 'Contact Business Owner to Unlock' })}</span>
              </div>
              <p className="text-[#566B69] dark:text-[#8FA8A4]">
                {t('accessDenied.ownerNotice', { defaultValue: 'Only the store owner has authorization to purchase or renew the subscription plan.' })}
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
          {isPlanIssue ? (
            <>
              <Button
                onClick={handleGoToBilling}
                className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow-xs font-semibold"
              >
                <QrCode className="w-4 h-4" />
                <span>{t('accessDenied.upgradeNow', { defaultValue: 'Upgrade Plan Now' })}</span>
              </Button>
              <Button
                onClick={handleReturnToDashboard}
                variant="outline"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Store className="w-4 h-4" />
                <span>{t('accessDenied.returnDashboard', { defaultValue: 'Return to Dashboard' })}</span>
              </Button>
            </>
          ) : (
            <Button
              onClick={handleReturnToDashboard}
              variant="primary"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Store className="w-4 h-4" />
              <span>{t('accessDenied.returnDashboard', { defaultValue: 'Return to Dashboard' })}</span>
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

