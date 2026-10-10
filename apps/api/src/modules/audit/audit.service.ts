import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditLogModel: Model<AuditLogDocument>,
  ) {}

  async logAction(params: {
    businessId: string;
    userId: string;
    userName: string;
    action: string;
    entityType: 'INVOICE' | 'PURCHASE' | 'PAYMENT' | 'STOCK' | 'PRODUCT' | 'PARTY' | 'BUSINESS';
    entityId: string;
    details?: Record<string, any>;
  }) {
    try {
      const entry = new this.auditLogModel(params);
      await entry.save();
      this.logger.log(`Audit: [${params.businessId}] ${params.action} on ${params.entityType}:${params.entityId} by ${params.userName}`);
    } catch (err: any) {
      this.logger.error(`Failed to record audit log: ${err.message}`);
    }
  }

  async getLogs(businessId: string, limit = 50, skip = 0) {
    const logs = await this.auditLogModel
      .find({ businessId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await this.auditLogModel.countDocuments({ businessId });

    return {
      items: logs.map((l) => ({
        id: l._id.toString(),
        businessId: l.businessId,
        userId: l.userId,
        userName: l.userName,
        action: l.action,
        entityType: l.entityType,
        entityId: l.entityId,
        details: l.details,
        createdAt: (l as any).createdAt,
      })),
      total,
      limit,
      skip,
    };
  }
}
