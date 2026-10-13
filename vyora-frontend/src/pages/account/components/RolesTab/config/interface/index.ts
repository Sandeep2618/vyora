export interface StaffPermissionMap {
  invoices: boolean;
  parties: boolean;
  products: boolean;
  inventory: boolean;
  purchases: boolean;
  payments: boolean;
  reports: boolean;
  [key: string]: boolean;
}
