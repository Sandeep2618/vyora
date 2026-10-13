import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StaffMembersTableProps } from '../config/interface';

export const StaffMembersTable: React.FC<StaffMembersTableProps> = ({
  staffList,
  isLoadingStaff,
  isOwner,
  updatingMemberId,
  onOpenAddModal,
  onRoleToggle,
  onRemoveStaff,
}) => {
  const { t } = useTranslation('account');

  return (
    <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D7E5E2] dark:border-[#1E3B38] pb-4">
        <div>
          <h2 className="text-base font-bold text-[#123B3A] dark:text-[#E6F4F1]">
            {t('rolesTab.teamDirectoryTitle', { defaultValue: 'Team Staff & Ownership Directory' })}
          </h2>
          <p className="text-xs text-[#566B69] dark:text-slate-400 mt-0.5">
            {t('rolesTab.teamDirectorySubtitle', {
              defaultValue:
                'Primary Owner is immutable and protected. Secondary owners can be promoted or demoted by the Primary Owner.',
            })}
          </p>
        </div>

        {isOwner && (
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenAddModal}
            className="flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t('rolesTab.addMember', { defaultValue: 'Add Team Member' })}</span>
          </Button>
        )}
      </div>

      {isLoadingStaff ? (
        <div className="p-8 text-center text-xs text-[#566B69] dark:text-slate-400">
          {t('rolesTab.loadingTeam', { defaultValue: 'Loading business team members...' })}
        </div>
      ) : staffList.length === 0 ? (
        <div className="p-8 text-center text-xs text-[#566B69] dark:text-slate-400">
          {t('rolesTab.noTeamMembers', { defaultValue: 'No team members registered yet.' })}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#D7E5E2] dark:border-[#1E3B38] text-[#566B69] dark:text-slate-400 font-semibold">
                <th className="py-2.5 px-3">{t('rolesTab.colNameEmail', { defaultValue: 'Name & Email' })}</th>
                <th className="py-2.5 px-3">{t('rolesTab.colRoleTier', { defaultValue: 'Role Tier' })}</th>
                <th className="py-2.5 px-3">{t('rolesTab.colRightsScope', { defaultValue: 'Rights Scope' })}</th>
                <th className="py-2.5 px-3 text-right">{t('rolesTab.colActions', { defaultValue: 'Actions' })}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EFEB] dark:divide-[#1E3B38]">
              {staffList.map((m) => {
                const isMemberOwner = m.role === 'OWNER' || m.role === 'ADMIN';

                return (
                  <tr key={m.id} className="hover:bg-[#F4F8F7]/60 dark:hover:bg-[#162E2D]/60">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#E6F4F2] dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-[#14B8A6] flex items-center justify-center font-bold text-xs">
                          {m.name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-[#123B3A] dark:text-[#E6F4F1]">{m.name}</p>
                          <p className="text-[11px] text-[#566B69] dark:text-slate-400">{m.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <Badge variant={isMemberOwner ? 'paid' : 'neutral'}>
                          {isMemberOwner ? 'OWNER' : 'STAFF'}
                        </Badge>
                        {m.isPrimaryOwner && (
                          <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold px-1.5 py-0.5 rounded">
                            {t('rolesTab.primaryOwnerBadge', { defaultValue: 'Primary Owner' })}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-[11px] text-[#566B69] dark:text-slate-400">
                      {isMemberOwner
                        ? t('rolesTab.ownerFullAccess', { defaultValue: '100% Administrative & Financial Access' })
                        : t('rolesTab.staffRestrictedAccess', { defaultValue: 'Restricted according to Staff Module Rights' })}
                    </td>

                    <td className="py-3 px-3 text-right">
                      {isOwner && !m.isPrimaryOwner ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={updatingMemberId === m.id}
                            onClick={() => onRoleToggle(m)}
                            className="text-[11px] py-1 h-7"
                          >
                            {isMemberOwner
                              ? t('rolesTab.demoteToStaff', { defaultValue: 'Demote to Staff' })
                              : t('rolesTab.promoteToOwner', { defaultValue: 'Promote to Owner' })}
                          </Button>
                          <button
                            type="button"
                            onClick={() => onRemoveStaff(m)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-rose-950/30 rounded cursor-pointer"
                            title="Remove member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#8CA19F] dark:text-slate-500 italic">
                          {t('rolesTab.protected', { defaultValue: 'Protected' })}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
