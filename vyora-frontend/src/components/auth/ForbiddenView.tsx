import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, Sparkles, Clock, QrCode, Store, Lock } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

export interface ForbiddenViewProps {
  type?: 'PLAN_RESTRICTION' | 'ROLE_RESTRICTION';
  title?: string;
  message?: string;
  requiredPlan?: string;
  requiredRole?: string;
  autoRedirectSeconds?: number;
}

export const ForbiddenView: React.FC<ForbiddenViewProps> = ({
  type = 'PLAN_RESTRICTION',
  title,
  message,
  requiredPlan = 'growth',
  requiredRole,
  autoRedirectSeconds = 5,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const { role, isOwner } = useAuth();
  const [secondsLeft, setSecondsLeft] = useState<number>(autoRedirectSeconds);

  const isPlanIssue = type === 'PLAN_RESTRICTION';

  const defaultTitle = isPlanIssue
    ? t('accessDenied.planUpgradeRequired', { defaultValue: 'Plan Upgrade Required' })
    : t('accessDenied.permissionRestricted', { defaultValue: 'Access Restricted' });

  const defaultMessage = isPlanIssue
    ? t(
        'accessDenied.planMessage',
        { defaultValue: 'This feature is available on Growth and Enterprise plans. Upgrade your subscription to unlock unlimited access.' }
      )
    : t(
        'accessDenied.roleMessage',
        { defaultValue: 'Your current role does not have permission to access or modify this section. Please ask your business owner to adjust your staff rights in Vyora.' }
      );

  useEffect(() => {
    setSecondsLeft(autoRedirectSeconds);

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (isPlanIssue) {
            navigate('/account?tab=BILLING');
          } else {
            navigate('/');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRedirectSeconds, isPlanIssue, navigate]);

  const handleGoToBilling = () => {
    navigate('/account?tab=BILLING');
  };

  const handleReturnToDashboard = () => {
    navigate('/');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-2xl p-8 text-center shadow-lg space-y-6">
        {/* Visual Badge Icon */}
        <div
          className={`w-16 h-16 mx-auto rounded-2xl border flex items-center justify-center shadow-xs ${
            isPlanIssue
              ? 'bg-purple-50 border-purple-200 text-purple-600 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300'
              : 'bg-[#FEF3C7] border-[#FDE68A] text-[#D97706]'
          }`}
        >
          {isPlanIssue ? <Sparkles className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
        </div>

        {/* Text Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs font-bold text-red-600 dark:text-red-400">
            <Lock className="w-3 h-3" />
            <span>403 FORBIDDEN</span>
          </div>
          <h2 className="text-xl font-bold text-[#123B3A] dark:text-[#F0FDFA]">
            {title || defaultTitle}
          </h2>
          <p className="text-sm text-[#566B69] dark:text-[#8FA8A4] leading-relaxed">
            {message || defaultMessage}
          </p>

          {isPlanIssue && requiredPlan && (
            <p className="text-xs text-[#64748B] dark:text-[#8FA8A4] pt-1">
              Required Plan:{' '}
              <span className="font-bold text-purple-600 dark:text-purple-400 uppercase">
                {requiredPlan}
              </span>
            </p>
          )}

          {!isPlanIssue && requiredRole && (
            <p className="text-xs text-[#64748B] dark:text-[#8FA8A4] pt-1">
              Requires:{' '}
              <span className="font-bold text-[#123B3A] dark:text-[#F0FDFA]">
                {requiredRole}
              </span>
            </p>
          )}
        </div>

        {/* Live Countdown Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold shadow-2xs">
          <Clock className="w-4 h-4 animate-spin" />
          <span>
            {isPlanIssue
              ? t('accessDenied.redirecting', {
                  seconds: secondsLeft,
                  defaultValue: `Redirecting to Billing in ${secondsLeft}s...`,
                })
              : `Redirecting to Dashboard in ${secondsLeft}s...`}
          </span>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {isPlanIssue ? (
            <>
              <Button
                onClick={handleGoToBilling}
                className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-xs"
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
              className="w-full flex items-center justify-center gap-2"
            >
              <Store className="w-4 h-4" />
              <span>{t('accessDenied.returnDashboard', { defaultValue: 'Return to Dashboard' })}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
