import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessApi } from '@/api/business';
import { useAuth } from '@/context/AuthContext';
import { StaffMember, UserRole } from '@/types';
import { toast } from '@/components/ui/Toast';
import { ModuleRightsMatrix } from '@/pages/account/components/roles/ModuleRightsMatrix';
import { StaffMembersTable } from '@/pages/account/components/roles/StaffMembersTable';
import { StaffInviteModal } from '@/pages/account/components/roles/StaffInviteModal';
import { DEFAULT_STAFF_PERMISSIONS } from '../config/constant';

export const RolesTab: React.FC = () => {
  const { t } = useTranslation('account');
  const { business, isOwner, updateStaffPermissions } = useAuth();
  const queryClient = useQueryClient();

  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    ...DEFAULT_STAFF_PERMISSIONS,
    invoices: business?.staffPermissions?.invoices ?? DEFAULT_STAFF_PERMISSIONS.invoices,
    parties: business?.staffPermissions?.parties ?? DEFAULT_STAFF_PERMISSIONS.parties,
    products: business?.staffPermissions?.products ?? DEFAULT_STAFF_PERMISSIONS.products,
    inventory: business?.staffPermissions?.inventory ?? DEFAULT_STAFF_PERMISSIONS.inventory,
    purchases: business?.staffPermissions?.purchases ?? DEFAULT_STAFF_PERMISSIONS.purchases,
    payments: business?.staffPermissions?.payments ?? DEFAULT_STAFF_PERMISSIONS.payments,
    reports: business?.staffPermissions?.reports ?? DEFAULT_STAFF_PERMISSIONS.reports,
  });

  useEffect(() => {
    if (business?.staffPermissions) {
      setPermissions({
        invoices: business.staffPermissions.invoices ?? true,
        parties: business.staffPermissions.parties ?? true,
        products: business.staffPermissions.products ?? true,
        inventory: business.staffPermissions.inventory ?? true,
        purchases: business.staffPermissions.purchases ?? true,
        payments: business.staffPermissions.payments ?? true,
        reports: business.staffPermissions.reports ?? false,
      });
    }
  }, [business?.staffPermissions]);

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState<UserRole>('STAFF');
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);

  const { data: staffList = [], isLoading: isLoadingStaff } = useQuery<StaffMember[]>({
    queryKey: ['business-staff'],
    queryFn: () => businessApi.getStaff(),
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: (updated: Record<string, boolean>) => updateStaffPermissions(updated),
    onSuccess: () => {
      toast.success(
        t('rolesTab.rightsSaved', {
          defaultValue: 'Staff module rights updated! Staff accounts will see changes immediately.',
        }),
      );
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update staff permissions');
    },
  });

  const addStaffMutation = useMutation({
    mutationFn: () =>
      businessApi.addStaff({
        name: staffName,
        email: staffEmail,
        role: staffRole,
      }),
    onSuccess: () => {
      setIsStaffModalOpen(false);
      setStaffName('');
      setStaffEmail('');
      queryClient.invalidateQueries({ queryKey: ['business-staff'] });
      toast.success(`Staff member ${staffName} added successfully!`);
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to add staff member');
    },
  });

  const handleTogglePermission = (moduleKey: string) => {
    if (!isOwner) return;
    const updated = {
      ...permissions,
      [moduleKey]: !permissions[moduleKey],
    };
    setPermissions(updated);
    updatePermissionsMutation.mutate(updated);
  };

  const handleRoleToggle = async (member: StaffMember) => {
    if (!isOwner) return;
    if (member.isPrimaryOwner) {
      toast.error('The Primary Owner is permanently protected and cannot be demoted.');
      return;
    }
    const newRole: UserRole = member.role === 'OWNER' ? 'STAFF' : 'OWNER';
    try {
      setUpdatingMemberId(member.id);
      await businessApi.updateStaffRole(member.id, newRole);
      queryClient.invalidateQueries({ queryKey: ['business-staff'] });
      toast.success(`Updated ${member.name}'s role to ${newRole === 'OWNER' ? 'Owner (Full Access)' : 'Staff Member'}.`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update member role');
    } finally {
      setUpdatingMemberId(null);
    }
  };

  const handleRemoveStaff = async (member: StaffMember) => {
    if (member.isPrimaryOwner) {
      toast.error('Primary owner cannot be removed.');
      return;
    }
    if (!window.confirm(`Are you sure you want to remove ${member.name} from this business?`)) return;
    try {
      await businessApi.removeStaff(member.id);
      queryClient.invalidateQueries({ queryKey: ['business-staff'] });
      toast.success(`Member ${member.name} removed from business.`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove member');
    }
  };

  return (
    <div className="space-y-6">
      {/* Module-level rights configuration (Owner Only) */}
      <ModuleRightsMatrix
        permissions={permissions}
        isOwner={isOwner}
        onTogglePermission={handleTogglePermission}
      />

      {/* Team Members List */}
      <StaffMembersTable
        staffList={staffList}
        isLoadingStaff={isLoadingStaff}
        isOwner={isOwner}
        updatingMemberId={updatingMemberId}
        onOpenAddModal={() => setIsStaffModalOpen(true)}
        onRoleToggle={handleRoleToggle}
        onRemoveStaff={handleRemoveStaff}
      />

      {/* Add Staff Modal */}
      <StaffInviteModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        staffName={staffName}
        onStaffNameChange={setStaffName}
        staffEmail={staffEmail}
        onStaffEmailChange={setStaffEmail}
        staffRole={staffRole}
        onStaffRoleChange={setStaffRole}
        onSubmit={() => addStaffMutation.mutate()}
        isSubmitting={addStaffMutation.isPending}
      />
    </div>
  );
};
