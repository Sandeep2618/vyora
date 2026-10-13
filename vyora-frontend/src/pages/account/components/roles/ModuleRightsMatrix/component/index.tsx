import React from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { ModuleRightsMatrixProps } from '../config/interface';
import { MODULE_RIGHTS_METADATA } from '../config/constant';

export const ModuleRightsMatrix: React.FC<ModuleRightsMatrixProps> = ({
  permissions,
  isOwner,
  onTogglePermission,
}) => {
  const { t } = useTranslation('account');

  return (
    <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D7E5E2] dark:border-[#1E3B38] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#123B3A] dark:text-[#E6F4F1]">
              {t('rolesTab.title', { defaultValue: 'Staff Module Access Rights' })}
            </h2>
            <Badge variant="paid">{t('rolesTab.ownerManaged', { defaultValue: 'Owner Managed' })}</Badge>
          </div>
          <p className="text-xs text-[#566B69] dark:text-slate-400 mt-0.5">
            {t('rolesTab.subtitle', {
              defaultValue:
                'Configure which ERP modules are visible and accessible to Staff members. Owners always retain 100% full administrative access.',
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULE_RIGHTS_METADATA.map((mod) => {
          const isAllowed = permissions[mod.key] ?? true;
          const Icon = mod.icon;

          return (
            <div
              key={mod.key}
              className={cn(
                'p-4 rounded-xl border transition-all flex flex-col justify-between',
                isAllowed
                  ? 'bg-white dark:bg-[#162E2D] border-[#D7E5E2] dark:border-[#1E3B38] hover:border-[#0F766E]/40'
                  : 'bg-[#F9FBFA] dark:bg-[#0D1C1B] border-[#E2EBE9] dark:border-[#1A3331] opacity-80',
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#E6F4F2] dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-[#14B8A6] flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <button
                    type="button"
                    disabled={!isOwner}
                    onClick={() => onTogglePermission(mod.key)}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer',
                      isAllowed
                        ? 'bg-[#DCFCE7] dark:bg-emerald-950/50 text-[#15803D] dark:text-emerald-400 hover:bg-[#BBF7D0]'
                        : 'bg-[#FEE2E2] dark:bg-rose-950/50 text-[#B91C1C] dark:text-rose-400 hover:bg-[#FECACA]',
                    )}
                  >
                    {isAllowed ? (
                      <>
                        <Eye className="w-3 h-3" />
                        <span>{t('rolesTab.enabledForStaff', { defaultValue: 'Enabled for Staff' })}</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" />
                        <span>{t('rolesTab.hiddenForStaff', { defaultValue: 'Hidden for Staff' })}</span>
                      </>
                    )}
                  </button>
                </div>

                <h3 className="text-xs font-bold text-[#123B3A] dark:text-[#E6F4F1]">
                  {t(`rolesTab.modules.${mod.key}.title`, { defaultValue: mod.title })}
                </h3>
                <p className="text-[11px] text-[#566B69] dark:text-slate-400 mt-1 leading-relaxed">
                  {t(`rolesTab.modules.${mod.key}.desc`, { defaultValue: mod.desc })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
