export const formatAuditDate = (dateStr?: string): string => {
  return dateStr ? new Date(dateStr).toLocaleString('en-IN') : '-';
};
