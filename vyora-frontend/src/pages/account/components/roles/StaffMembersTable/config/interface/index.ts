import { StaffMember } from '@/types';

export interface StaffMembersTableProps {
  staffList: StaffMember[];
  isLoadingStaff: boolean;
  isOwner: boolean;
  updatingMemberId: string | null;
  onOpenAddModal: () => void;
  onRoleToggle: (member: StaffMember) => void;
  onRemoveStaff: (member: StaffMember) => void;
}
