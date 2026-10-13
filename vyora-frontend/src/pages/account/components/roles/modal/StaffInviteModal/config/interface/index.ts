import { UserRole } from '@/types';

export interface StaffInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffName: string;
  onStaffNameChange: (val: string) => void;
  staffEmail: string;
  onStaffEmailChange: (val: string) => void;
  staffRole: UserRole;
  onStaffRoleChange: (val: UserRole) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}
