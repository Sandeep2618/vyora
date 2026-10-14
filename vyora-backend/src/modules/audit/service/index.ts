import { AuditLogModel } from '../model';
import { logger } from '../../../util';

export class AuditService {
  static async logAction(params: {
    businessId: string;
    userId: string;
    userName: string;
    action: string;
    entityType: 'INVOICE' | 'PURCHASE' | 'PAYMENT' | 'STOCK' | 'PRODUCT' | 'PARTY' | 'BUSINESS';
    entityId: string;
    details?: Record<string, any>;
    ipAddress?: string;
  }) {
    try {
      const entry = new AuditLogModel(params);
      await entry.save();
      logger.info(
        `Audit: [${params.businessId}] ${params.action} on ${params.entityType}:${params.entityId} by ${params.userName}`,
      );
    } catch (err: any) {
      logger.error(`Failed to record audit log: ${err.message}`);
    }
  }

  static async getLogs(businessId: string, limit = 50, skip = 0) {
    const [logs, total] = await Promise.all([
      AuditLogModel.find({ businessId }).sort({ createdAt: -1 }).limit(limit).skip(skip).lean(),
      AuditLogModel.countDocuments({ businessId }),
    ]);

    return {
      items: logs.map((l: any) => ({
        id: l._id.toString(),
        businessId: l.businessId,
        userId: l.userId,
        userName: l.userName,
        action: l.action,
        entityType: l.entityType,
        entityId: l.entityId,
        details: l.details,
        createdAt: l.createdAt,
      })),
      total,
      limit,
      skip,
    };
  }
}
