import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Lock,
  Sparkles,
  RefreshCw,
  Mail,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { businessApi } from '../../api/business';
import { StaffMember, UserRole, SubscriptionPlan } from '../../types';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { PlanPurchaseModal } from '../../components/subscription/PlanPurchaseModal';
import { cn } from '../../lib/utils';

export const RolesPage: React.FC = () => {
  const { user, isOwner, plan, updateSubscriptionPlan } = useAuth();
  const [members, setMembers] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'OWNER' | 'STAFF'>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'STAFF' as UserRole,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [memberToDelete, setMemberToDelete] = useState<StaffMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const data = await businessApi.getStaff();
      setMembers(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const currentMember = members.find((m) => m.userId === user?.id);
  const isCurrentPrimaryOwner = currentMember?.isPrimaryOwner ?? false;

  const handleRoleToggle = async (member: StaffMember) => {
    if (!isOwner) return;
    if (member.isPrimaryOwner) {
      setErrorMsg('The primary business owner is permanently protected and cannot be demoted.');
      return;
    }
    const isMemberOwner = member.role === 'OWNER' || member.role === 'ADMIN';
    if (isMemberOwner && !isCurrentPrimaryOwner) {
      setErrorMsg('Only the primary business owner can demote or modify an Owner.');
      return;
    }

    const newRole: UserRole = isMemberOwner ? 'STAFF' : 'OWNER';

    try {
      setUpdatingId(member.id);
      setErrorMsg(null);
      setSuccessMsg(null);
      await businessApi.updateStaffRole(member.id, newRole);
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, role: newRole } : m)),
      );
      setSuccessMsg(`Updated ${member.name}'s role to ${newRole === 'OWNER' ? 'Owner (Full Access)' : 'Staff (View Only)'}.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update member role');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusToggle = async (member: StaffMember) => {
    if (!isOwner) return;
    if (member.isPrimaryOwner) {
      setErrorMsg('The primary business owner cannot be deactivated.');
      return;
    }
    const isMemberOwner = member.role === 'OWNER' || member.role === 'ADMIN';
    if (isMemberOwner && !isCurrentPrimaryOwner) {
      setErrorMsg('Only the primary business owner can modify owner status.');
      return;
    }

    const nextStatus = !member.isActive;

    try {
      setUpdatingId(member.id);
      setErrorMsg(null);
      await businessApi.toggleStaffStatus(member.id, nextStatus);
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, isActive: nextStatus } : m)),
      );
      setSuccessMsg(`${member.name} has been ${nextStatus ? 'activated' : 'suspended'}.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update access status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    if (plan === 'starter') {
      setIsAddModalOpen(false);
      setIsUpgradeModalOpen(true);
      return;
    }

    if (plan === 'growth' && members.length >= 4) {
      setErrorMsg('Growth plan supports up to 3 staff members. Please upgrade to Business Pro for unlimited members.');
      setIsAddModalOpen(false);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      const newMember = await businessApi.addStaff(formData);
      setMembers((prev) => [...prev, newMember]);
      setIsAddModalOpen(false);
      setFormData({ name: '', email: '', role: 'STAFF' });
      setSuccessMsg(`Added ${newMember.name} to your business team!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add team member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete || !isOwner) return;
    if (memberToDelete.isPrimaryOwner) {
      setErrorMsg('The primary business owner cannot be removed.');
      return;
    }
    const isMemberOwner = memberToDelete.role === 'OWNER' || memberToDelete.role === 'ADMIN';
    if (isMemberOwner && !isCurrentPrimaryOwner) {
      setErrorMsg('Only the primary business owner can remove an Owner.');
      return;
    }

    try {
      setIsDeleting(true);
      setErrorMsg(null);
      await businessApi.removeStaff(memberToDelete.id);
      setMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id));
      setSuccessMsg(`Removed ${memberToDelete.name} from business.`);
      setMemberToDelete(null);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to remove member');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePlanUpgrade = async (targetPlan: SubscriptionPlan) => {
    try {
      await updateSubscriptionPlan(targetPlan);
      setIsUpgradeModalOpen(false);
      setSuccessMsg(`Successfully switched subscription to ${targetPlan === 'enterprise' ? 'Business Pro' : 'Growth'}!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update subscription');
    }
  };

  // Filtered members
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      roleFilter === 'ALL' ||
      (roleFilter === 'OWNER' && (m.role === 'OWNER' || m.role === 'ADMIN')) ||
      (roleFilter === 'STAFF' && m.role === 'STAFF');
    return matchesSearch && matchesRole;
  });

  const ownerCount = members.filter((m) => m.role === 'OWNER' || m.role === 'ADMIN').length;
  const staffCount = members.filter((m) => m.role === 'STAFF').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#D7E5E2]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#123B3A] tracking-tight">
              Team Roles & Permissions
            </h1>
            <span
              className={cn(
                'px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wide',
                plan === 'enterprise'
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : plan === 'growth'
                  ? 'bg-teal-50 text-[#0F766E] border-[#A0D2CA]'
                  : 'bg-amber-50 text-amber-700 border-amber-200',
              )}
            >
              {plan === 'enterprise' ? 'Business Pro' : plan === 'growth' ? 'Growth' : 'Starter'} Plan
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#566B69] mt-1">
            Configure access levels. <strong className="text-[#123B3A]">Owners</strong> have full authority to create, edit, delete, and configure. <strong className="text-[#123B3A]">Staff</strong> accounts are view-only.
          </p>
        </div>

        {/* Action Button: Owner Only */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStaff}
            isLoading={isLoading}
            title="Refresh member list"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>

          {isOwner && (
            <Button
              onClick={() => {
                if (plan === 'starter') {
                  setIsUpgradeModalOpen(true);
                } else {
                  setIsAddModalOpen(true);
                }
              }}
              className="w-full sm:w-auto"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Team Member
            </Button>
          )}
        </div>
      </div>

      {/* Toast Alert Notifications */}
      {errorMsg && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-[#B91C1C] flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="flex-1 font-medium">{errorMsg}</p>
          <button onClick={() => setErrorMsg(null)} className="text-[#B91C1C] font-bold hover:underline">
            ✕
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl text-xs sm:text-sm text-[#15803D] flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <p className="flex-1 font-medium">{successMsg}</p>
          <button onClick={() => setSuccessMsg(null)} className="text-[#15803D] font-bold hover:underline">
            ✕
          </button>
        </div>
      )}

      {/* Role Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#D7E5E2] shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-[#E6F4F2] text-[#0F766E] flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#566B69] uppercase tracking-wider">Total Members</p>
            <p className="text-xl font-bold text-[#123B3A]">{members.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#D7E5E2] shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#566B69] uppercase tracking-wider">Owners (Full Access)</p>
            <p className="text-xl font-bold text-[#123B3A]">{ownerCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#D7E5E2] shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#566B69] uppercase tracking-wider">Staff (View Only)</p>
            <p className="text-xl font-bold text-[#123B3A]">{staffCount}</p>
          </div>
        </div>
      </div>

      {/* Plan Limits Banner for Starter Plan */}
      {plan === 'starter' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm font-bold text-amber-900">
                Team Role Delegation requires Growth or Business Pro
              </p>
              <p className="text-[11px] sm:text-xs text-amber-700 mt-0.5">
                The Starter Plan is limited to 1 Owner. Upgrade to Growth (₹499/mo) for up to 3 staff members, or Business Pro (₹999/mo) for unlimited staff.
              </p>
            </div>
          </div>
          {isOwner && (
            <Button
              size="sm"
              onClick={() => setIsUpgradeModalOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
            >
              Upgrade Plan
            </Button>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-[#D7E5E2] shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#566B69] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by member name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-[#D7E5E2] focus:outline-none focus:ring-1 focus:ring-[#0F766E] text-[#123B3A]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#566B69] shrink-0" />
          <span className="text-xs text-[#566B69] font-medium">Role:</span>
          <div className="flex rounded-lg border border-[#D7E5E2] p-0.5 bg-[#F4F8F7] text-xs">
            <button
              onClick={() => setRoleFilter('ALL')}
              className={cn(
                'px-2.5 py-1 rounded-md font-semibold transition-colors',
                roleFilter === 'ALL'
                  ? 'bg-white text-[#123B3A] shadow-xs'
                  : 'text-[#566B69] hover:text-[#123B3A]',
              )}
            >
              All
            </button>
            <button
              onClick={() => setRoleFilter('OWNER')}
              className={cn(
                'px-2.5 py-1 rounded-md font-semibold transition-colors',
                roleFilter === 'OWNER'
                  ? 'bg-white text-[#0F766E] shadow-xs'
                  : 'text-[#566B69] hover:text-[#123B3A]',
              )}
            >
              Owners
            </button>
            <button
              onClick={() => setRoleFilter('STAFF')}
              className={cn(
                'px-2.5 py-1 rounded-md font-semibold transition-colors',
                roleFilter === 'STAFF'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-[#566B69] hover:text-[#123B3A]',
              )}
            >
              Staff
            </button>
          </div>
        </div>
      </div>

      {/* Team Members Data Table */}
      <div className="bg-white rounded-xl border border-[#D7E5E2] shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-[#566B69] text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0F766E]" />
            Loading team members...
          </div>
        ) : filteredMembers.length === 0 ? (
          <EmptyState
            icon={Users}
            title={members.length === 0 ? 'No team members added yet' : 'No members found'}
            description={
              members.length === 0
                ? 'Add your team members to collaborate. You can switch their roles anytime.'
                : 'No users matched your search filters. Try resetting the filter.'
            }
            actionLabel={members.length === 0 && isOwner ? 'Add Team Member' : undefined}
            onAction={members.length === 0 && isOwner ? () => setIsAddModalOpen(true) : undefined}
          />
        ) : (
          <div className="overflow-x-auto -mx-1 sm:mx-0">
            <table className="w-full text-left text-xs sm:text-sm min-w-[720px] whitespace-nowrap">
              <thead className="bg-[#F4F8F7] border-b border-[#D7E5E2] text-[#566B69] font-bold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Current Role</th>
                  <th className="py-3 px-4 text-center">Role Switch</th>
                  <th className="py-3 px-4 text-center">Access Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D7E5E2]">
                {filteredMembers.map((member) => {
                  const isCurrentLoggedUser = member.userId === user?.id;
                  const isMemberOwner = member.role === 'OWNER' || member.role === 'ADMIN';
                  const isMemberPrimaryOwner = Boolean(member.isPrimaryOwner);
                  const hasPrimaryOwner = members.some((m) => m.isPrimaryOwner);
                  // A member is only the "last owner" if they are the primary owner alone or if no primary owner exists and ownerCount is 1
                  const isLastOwner = isMemberOwner && (!hasPrimaryOwner ? ownerCount <= 1 : isMemberPrimaryOwner && ownerCount <= 1);
                  const isRowUpdating = updatingId === member.id;

                  // Role toggle permissions
                  const canToggleRole =
                    isOwner &&
                    !isMemberPrimaryOwner &&
                    !isRowUpdating &&
                    !(isMemberOwner && !isCurrentPrimaryOwner) &&
                    !(isLastOwner && isMemberOwner);

                  let roleTooltip = `Click to switch to ${isMemberOwner ? 'Staff (View Only)' : 'Owner (Full Access)'}`;
                  if (!isOwner) {
                    roleTooltip = 'Only owners can change roles';
                  } else if (isMemberPrimaryOwner) {
                    roleTooltip = 'Primary Business Owner is permanently protected and cannot be changed';
                  } else if (isMemberOwner && !isCurrentPrimaryOwner) {
                    roleTooltip = 'Only the primary business owner can demote an Owner back to Staff';
                  } else if (isLastOwner && isMemberOwner) {
                    roleTooltip = 'Cannot demote the only remaining owner';
                  }

                  // Status toggle permissions
                  const canToggleStatus =
                    isOwner &&
                    !isMemberPrimaryOwner &&
                    !isRowUpdating &&
                    !(isMemberOwner && !isCurrentPrimaryOwner) &&
                    !(isLastOwner && member.isActive);

                  let statusTooltip = 'Toggle account access status';
                  if (!isOwner) {
                    statusTooltip = 'Only owners can toggle status';
                  } else if (isMemberPrimaryOwner) {
                    statusTooltip = 'Primary Business Owner cannot be suspended';
                  } else if (isMemberOwner && !isCurrentPrimaryOwner) {
                    statusTooltip = 'Only the primary owner can toggle owner status';
                  } else if (isLastOwner && member.isActive) {
                    statusTooltip = 'Cannot suspend the only owner';
                  }

                  // Delete permission: Primary owner can remove anyone except themselves. Promoted owners cannot remove any owner.
                  const canDeleteMember =
                    isOwner &&
                    !isCurrentLoggedUser &&
                    !isLastOwner &&
                    !isMemberPrimaryOwner &&
                    (!isMemberOwner || isCurrentPrimaryOwner);

                  return (
                    <tr
                      key={member.id}
                      className={cn(
                        'hover:bg-[#F9FCFB] transition-colors',
                        isCurrentLoggedUser && 'bg-teal-50/30',
                      )}
                    >
                      {/* Member Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#E6F4F2] text-[#0F766E] border border-[#D7E5E2] flex items-center justify-center font-bold text-xs shrink-0">
                            {member.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-[#123B3A]">{member.name}</span>
                              {isCurrentLoggedUser && (
                                <span className="px-1.5 py-0.2 bg-[#E6F4F2] text-[#0F766E] text-[10px] font-bold rounded">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#566B69] flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 opacity-70" />
                              {member.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Current Role Badge */}
                      <td className="py-3 px-4">
                        {isMemberPrimaryOwner ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#E6F4F2] text-[#0F766E] border border-[#A0D2CA] shadow-2xs">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E]" />
                            <span>👑 Primary Owner</span>
                          </span>
                        ) : isMemberOwner ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-[#0F766E] border border-[#A0D2CA]">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>OWNER (Full Access)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>STAFF (View Only)</span>
                          </span>
                        )}
                      </td>

                      {/* Role Switch / Toggle */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <span
                            className={cn(
                              'text-[11px] font-semibold',
                              !isMemberOwner ? 'text-amber-700 font-bold' : 'text-[#566B69]',
                            )}
                          >
                            Staff
                          </span>

                          <button
                            type="button"
                            role="switch"
                            aria-checked={isMemberOwner}
                            disabled={!canToggleRole}
                            onClick={() => handleRoleToggle(member)}
                            title={roleTooltip}
                            className={cn(
                              'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:ring-offset-2',
                              isMemberOwner ? 'bg-[#0F766E]' : 'bg-gray-300',
                              !canToggleRole && 'opacity-50 cursor-not-allowed',
                            )}
                          >
                            <span
                              aria-hidden="true"
                              className={cn(
                                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
                                isMemberOwner ? 'translate-x-5' : 'translate-x-0',
                              )}
                            />
                          </button>

                          <span
                            className={cn(
                              'text-[11px] font-semibold',
                              isMemberOwner ? 'text-[#0F766E] font-bold' : 'text-[#566B69]',
                            )}
                          >
                            Owner
                          </span>
                        </div>
                        {isMemberPrimaryOwner ? (
                          <p className="text-[10px] text-[#0F766E] mt-1 font-semibold">
                            Real Owner (Immune)
                          </p>
                        ) : isLastOwner ? (
                          <p className="text-[10px] text-amber-600 mt-1 font-medium">
                            Solo Owner (Protected)
                          </p>
                        ) : isMemberOwner && !isCurrentPrimaryOwner ? (
                          <p className="text-[10px] text-[#566B69] mt-1 font-medium">
                            Demote: Real Owner Only
                          </p>
                        ) : null}
                      </td>

                      {/* Access Active Status Switch */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={member.isActive}
                            disabled={!canToggleStatus}
                            onClick={() => handleStatusToggle(member)}
                            title={statusTooltip}
                            className={cn(
                              'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0F766E]',
                              member.isActive ? 'bg-[#15803D]' : 'bg-gray-300',
                              !canToggleStatus && 'opacity-50 cursor-not-allowed',
                            )}
                          >
                            <span
                              aria-hidden="true"
                              className={cn(
                                'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out',
                                member.isActive ? 'translate-x-4' : 'translate-x-0',
                              )}
                            />
                          </button>
                          <span
                            className={cn(
                              'text-xs font-bold',
                              member.isActive ? 'text-[#15803D]' : 'text-gray-400',
                            )}
                          >
                            {member.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </div>
                      </td>

                      {/* Actions: Owner Only */}
                      <td className="py-3 px-4 text-right">
                        {canDeleteMember ? (
                          <button
                            onClick={() => setMemberToDelete(member)}
                            className="p-1.5 text-[#566B69] hover:text-[#B91C1C] hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#566B69] italic">--</span>
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

      {/* Permissions Breakdown Guide */}
      <div className="bg-white p-5 rounded-xl border border-[#D7E5E2] shadow-xs">
        <h3 className="text-sm font-bold text-[#123B3A] mb-3 flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#0F766E]" />
          Role Permission Matrix
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-[#F4F8F7] rounded-lg border border-[#D7E5E2]">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0F766E]" />
              <strong className="text-[#123B3A]">Owner (Full Control)</strong>
            </div>
            <ul className="space-y-1 text-[#566B69] list-disc list-inside">
              <li>Add, Edit, and Finalize GST Invoices</li>
              <li>Add, Edit, and Delete Products & Catalog Items</li>
              <li>Add, Edit, and Manage Customers & Suppliers</li>
              <li>Record Purchases, Supplier Bills, and Payments</li>
              <li>Perform Audited Stock Adjustments (Enterprise)</li>
              <li>Change team roles, switch permissions, and manage billing plans</li>
            </ul>
          </div>

          <div className="p-3.5 bg-[#F4F8F7] rounded-lg border border-[#D7E5E2]">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
              <strong className="text-[#123B3A]">Staff (View Only)</strong>
            </div>
            <ul className="space-y-1 text-[#566B69] list-disc list-inside">
              <li>View Dashboard metrics, revenue, and stats</li>
              <li>View Invoice lists and preview/print PDF vouchers</li>
              <li>Browse Product catalog, units, prices, and taxes</li>
              <li>Browse Customer & Supplier directory and ledger balances</li>
              <li>Inspect stock levels and movement ledgers</li>
              <li className="text-[#B91C1C] font-semibold">
                Cannot create, edit, or delete any records or switch roles
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal: Add Team Member */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Team Member"
        description="Invite a team member to your Vyora business. Required fields are marked with an asterisk."
        maxWidth="md"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="add-member-form"
              isLoading={isSubmitting}
              className="w-full sm:w-auto"
            >
              Add Member
            </Button>
          </>
        }
      >
        <form id="add-member-form" onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#123B3A] mb-1">
              Full Name <span className="text-[#B91C1C] font-bold">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Patel"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-[#D7E5E2] focus:outline-none focus:ring-1 focus:ring-[#0F766E] text-[#123B3A]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#123B3A] mb-1">
              Email Address <span className="text-[#B91C1C] font-bold">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="e.g. ramesh@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-[#D7E5E2] focus:outline-none focus:ring-1 focus:ring-[#0F766E] text-[#123B3A]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#123B3A] mb-1">
              Initial Role <span className="text-[#B91C1C] font-bold">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <label
                className={cn(
                  'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors',
                  formData.role === 'STAFF'
                    ? 'border-[#0F766E] bg-[#E6F4F2] text-[#0F766E]'
                    : 'border-[#D7E5E2] bg-white text-[#566B69]',
                )}
              >
                <input
                  type="radio"
                  name="role"
                  value="STAFF"
                  checked={formData.role === 'STAFF'}
                  onChange={() => setFormData({ ...formData, role: 'STAFF' })}
                  className="accent-[#0F766E]"
                />
                <span className="text-xs font-semibold">Staff (View Only)</span>
              </label>

              <label
                className={cn(
                  'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors',
                  formData.role === 'OWNER'
                    ? 'border-[#0F766E] bg-[#E6F4F2] text-[#0F766E]'
                    : 'border-[#D7E5E2] bg-white text-[#566B69]',
                )}
              >
                <input
                  type="radio"
                  name="role"
                  value="OWNER"
                  checked={formData.role === 'OWNER'}
                  onChange={() => setFormData({ ...formData, role: 'OWNER' })}
                  className="accent-[#0F766E]"
                />
                <span className="text-xs font-semibold">Owner (Full Access)</span>
              </label>
            </div>
            <p className="text-[11px] text-[#566B69] mt-1.5">
              Default password set for new accounts is <code className="bg-gray-100 px-1 py-0.5 rounded text-[#123B3A]">VyoraStaff@123</code>.
            </p>
          </div>
        </form>
      </Modal>

      {/* Modal: Delete Confirmation */}
      <Modal
        isOpen={!!memberToDelete}
        onClose={() => setMemberToDelete(null)}
        title="Remove Team Member"
        maxWidth="sm"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMemberToDelete(null)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              isLoading={isDeleting}
              onClick={handleDeleteMember}
              className="w-full sm:w-auto"
            >
              Remove Member
            </Button>
          </>
        }
      >
        <p className="text-xs sm:text-sm text-[#566B69] leading-relaxed">
          Are you sure you want to remove <strong className="text-[#123B3A]">{memberToDelete?.name}</strong> from your business? They will immediately lose all access.
        </p>
      </Modal>

      {/* Plan Purchase & Checkout Modal */}
      <PlanPurchaseModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        targetPlan="growth"
        onSuccess={(newPlan) => {
          setSuccessMsg(
            `Successfully upgraded subscription to ${
              newPlan === 'enterprise' ? 'Business Pro' : 'Growth Plan'
            }! All tier privileges unlocked.`,
          );
          setTimeout(() => setSuccessMsg(null), 5000);
        }}
      />
    </div>
  );
};
