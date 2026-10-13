// Audit Trail Domain Types
export interface AuditLogEntry {
  id: string;
  businessId: string;
  userId: string;
  userName: string;
  action: string;
  entityType: 'INVOICE' | 'PURCHASE' | 'PAYMENT' | 'STOCK' | 'PRODUCT' | 'PARTY' | 'BUSINESS';
  entityId: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}
