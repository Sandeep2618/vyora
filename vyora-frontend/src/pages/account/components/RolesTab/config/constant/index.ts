import { StaffPermissionMap } from '../interface';

export const DEFAULT_STAFF_PERMISSIONS: StaffPermissionMap = {
  invoices: true,
  parties: true,
  products: true,
  inventory: true,
  purchases: true,
  payments: true,
  reports: false,
};
