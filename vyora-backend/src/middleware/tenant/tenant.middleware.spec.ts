import { describe, it, expect, vi } from 'vitest';
import { tenantMiddleware } from './index';
import { MembershipModel, BusinessModel } from '../../modules/business/model';
import { UnauthorizedError, ForbiddenError } from '../../util';

describe('tenantMiddleware - Tenant Isolation & Authorization', () => {
  it('calls next with UnauthorizedError when user is not authenticated', async () => {
    const req: any = { user: null };
    const res: any = {};
    const next = vi.fn();

    await tenantMiddleware(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('denies cross-tenant access when user has no membership in requested business', async () => {
    vi.spyOn(MembershipModel, 'findOne').mockResolvedValue(null as any);
    vi.spyOn(BusinessModel, 'findOne').mockResolvedValue(null as any);

    const req: any = {
      user: { id: 'user-hacker', role: 'STAFF', businessId: 'biz-own' },
      headers: { 'x-business-id': 'biz-victim' },
    };
    const res: any = {};
    const next = vi.fn();

    await tenantMiddleware(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });

  it('permits request and attaches businessId when membership is verified', async () => {
    vi.spyOn(MembershipModel, 'findOne').mockResolvedValue({
      userId: 'user-1',
      businessId: 'biz-1',
      role: 'OWNER',
      isActive: true,
      permissions: ['ALL'],
    } as any);

    const req: any = {
      user: { id: 'user-1', role: 'OWNER', businessId: 'biz-1' },
      headers: { 'x-business-id': 'biz-1' },
    };
    const res: any = {};
    const next = vi.fn();

    await tenantMiddleware(req, res, next);
    expect(next).toHaveBeenCalledWith();
    expect(req.businessId).toBe('biz-1');
    expect(req.businessRole).toBe('OWNER');
  });
});
