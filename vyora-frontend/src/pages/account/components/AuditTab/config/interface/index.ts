export interface AuditLogItem {
  _id?: string;
  id?: string;
  createdAt?: string;
  userName?: string;
  actor?: string;
  action?: string;
  entity?: string;
  collectionName?: string;
}

export interface AuditLogsResponse {
  items: AuditLogItem[];
  total: number;
}
