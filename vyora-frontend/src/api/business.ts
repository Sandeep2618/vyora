import { api } from '../lib/api';
import { BusinessProfile, BusinessProfileInput, UserRole } from '../types';

export interface StaffMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export const businessApi = {
  getCurrent: (): Promise<BusinessProfile> => {
    return api.get<BusinessProfile>('/business/current');
  },

  updateCurrent: (data: BusinessProfileInput): Promise<BusinessProfile> => {
    return api.put<BusinessProfile>('/business/current', data);
  },

  getStaff: (): Promise<StaffMember[]> => {
    return api.get<StaffMember[]>('/business/staff');
  },

  addStaff: (data: { name: string; email: string; role: UserRole }): Promise<StaffMember> => {
    return api.post<StaffMember>('/business/staff', data);
  },
};
