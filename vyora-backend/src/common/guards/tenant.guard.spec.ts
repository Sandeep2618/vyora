import { describe, it, expect, vi } from 'vitest';
import { TenantGuard } from './tenant.guard';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';

describe('TenantGuard - Tenant Isolation & Authorization', () => {
  it('throws UnauthorizedException when user is not authenticated', async () => {
    const mockMembershipModel: any = { findOne: vi.fn() };
    const guard = new TenantGuard(mockMembershipModel);

    const mockContext: any = {
      switchToHttp: () => ({
        getRequest: () => ({ user: null }),
      }),
    };

    await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
  });

  it('denies cross-tenant access when user has no membership in requested business', async () => {
    const mockMembershipModel: any = {
      findOne: vi.fn().mockResolvedValue(null), // no membership found for this business
    };
    const guard = new TenantGuard(mockMembershipModel);

    const mockContext: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 'user-hacker', businessId: 'biz-own' },
          headers: { 'x-business-id': 'biz-victim' }, // attempting to spoof another business
        }),
      }),
    };

    await expect(guard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
    expect(mockMembershipModel.findOne).toHaveBeenCalledWith({
      userId: 'user-hacker',
      businessId: 'biz-victim',
    });
  });

  it('permits request and attaches businessId when membership is verified', async () => {
    const mockMembershipModel: any = {
      findOne: vi.fn().mockResolvedValue({
        userId: 'user-1',
        businessId: 'biz-1',
        role: 'OWNER',
      }),
    };
    const guard = new TenantGuard(mockMembershipModel);

    const mockRequest: any = {
      user: { id: 'user-1', businessId: 'biz-1' },
      headers: { 'x-business-id': 'biz-1' },
    };

    const mockContext: any = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    };

    const allowed = await guard.canActivate(mockContext);
    expect(allowed).toBe(true);
    expect(mockRequest.businessId).toBe('biz-1');
    expect(mockRequest.businessRole).toBe('OWNER');
  });
});
