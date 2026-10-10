import { api } from '../lib/api';
import { BusinessProfile, BusinessProfileInput, UserRole, StaffMember, SubscriptionPlan } from '../types';

export const businessApi = {
  getCurrent: (): Promise<BusinessProfile> => {
    return api.get<BusinessProfile>('/business/current');
  },

  updateCurrent: (data: BusinessProfileInput): Promise<BusinessProfile> => {
    return api.put<BusinessProfile>('/business/current', data);
  },

  updateSubscriptionPlan: (plan: SubscriptionPlan): Promise<BusinessProfile> => {
    return api.put<BusinessProfile>('/business/plan', { plan });
  },

  getStaff: (): Promise<StaffMember[]> => {
    return api.get<StaffMember[]>('/business/staff');
  },

  addStaff: (data: { name: string; email: string; role: UserRole }): Promise<StaffMember> => {
    return api.post<StaffMember>('/business/staff', data);
  },

  updateStaffRole: (membershipId: string, role: UserRole): Promise<StaffMember> => {
    return api.patch<StaffMember>(`/business/staff/${membershipId}/role`, { role });
  },

  toggleStaffStatus: (membershipId: string, isActive: boolean): Promise<StaffMember> => {
    return api.patch<StaffMember>(`/business/staff/${membershipId}/status`, { isActive });
  },

  removeStaff: (membershipId: string): Promise<{ success: boolean }> => {
    return api.delete<{ success: boolean }>(`/business/staff/${membershipId}`);
  },
};

