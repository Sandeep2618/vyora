import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';
import { StaffInviteModalProps } from '../config/interface';

export const StaffInviteModal: React.FC<StaffInviteModalProps> = ({
  isOpen,
  onClose,
  staffName,
  onStaffNameChange,
  staffEmail,
  onStaffEmailChange,
  staffRole,
  onStaffRoleChange,
  onSubmit,
  isSubmitting,
}) => {
  const { t } = useTranslation('account');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('rolesTab.inviteModal.title', { defaultValue: 'Invite New Business Member' })}
      description={t('rolesTab.inviteModal.description', {
        defaultValue: 'Add a staff user or secondary business owner to collaborate.',
      })}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            {t('rolesTab.inviteModal.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!staffName || !staffEmail}
            isLoading={isSubmitting}
            onClick={onSubmit}
          >
            {t('rolesTab.inviteModal.submit', { defaultValue: 'Add Member' })}
          </Button>
        </>
      }
    >
      <div className="space-y-4 pt-2">
        <Input
          label={t('rolesTab.inviteModal.nameLabel', { defaultValue: 'Full Name' })}
          placeholder={t('rolesTab.inviteModal.namePlaceholder', { defaultValue: 'e.g. Rahul Sharma' })}
          value={staffName}
          onChange={(e) => onStaffNameChange(e.target.value)}
          required
        />

        <Input
          label={t('rolesTab.inviteModal.emailLabel', { defaultValue: 'Email Address' })}
          type="email"
          placeholder={t('rolesTab.inviteModal.emailPlaceholder', { defaultValue: 'e.g. rahul@company.com' })}
          value={staffEmail}
          onChange={(e) => onStaffEmailChange(e.target.value)}
          required
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#123B3A] dark:text-[#E6F4F1]">
            {t('rolesTab.inviteModal.roleLabel', { defaultValue: 'Role Assignment' })}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onStaffRoleChange('STAFF')}
              className={cn(
                'p-3 rounded-xl border text-left transition-all cursor-pointer',
                staffRole === 'STAFF'
                  ? 'border-[#0F766E] bg-[#E6F4F2] dark:bg-[#162E2D] text-[#0F766E] dark:text-[#14B8A6]'
                  : 'border-[#D7E5E2] dark:border-[#1E3B38] bg-white dark:bg-[#112322] text-[#566B69] dark:text-slate-400',
              )}
            >
              <p className="font-bold text-xs">{t('rolesTab.inviteModal.staffRole', { defaultValue: 'Staff Member' })}</p>
              <p className="text-[10px] mt-0.5">
                {t('rolesTab.inviteModal.staffRoleDesc', {
                  defaultValue: 'Operates counter based on enabled module rights',
                })}
              </p>
            </button>

            <button
              type="button"
              onClick={() => onStaffRoleChange('OWNER')}
              className={cn(
                'p-3 rounded-xl border text-left transition-all cursor-pointer',
                staffRole === 'OWNER'
                  ? 'border-[#0F766E] bg-[#E6F4F2] dark:bg-[#162E2D] text-[#0F766E] dark:text-[#14B8A6]'
                  : 'border-[#D7E5E2] dark:border-[#1E3B38] bg-white dark:bg-[#112322] text-[#566B69] dark:text-slate-400',
              )}
            >
              <p className="font-bold text-xs">{t('rolesTab.inviteModal.ownerRole', { defaultValue: 'Secondary Owner' })}</p>
              <p className="text-[10px] mt-0.5">
                {t('rolesTab.inviteModal.ownerRoleDesc', {
                  defaultValue: 'Full admin access, billing & user management',
                })}
              </p>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
