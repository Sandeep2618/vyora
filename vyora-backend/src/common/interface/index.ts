import { Request } from 'express';
import { UserRole, UserProfile } from '@vyora/shared-types';

export interface PaginationQuery {
  limit?: number;
  skip?: number;
  page?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  items: T[];
  total: number;
  limit: number;
  skip: number;
}

export interface AuthenticatedUser {
  id: string;
  email?: string;
  phone?: string;
  name: string;
  role: UserRole;
  businessId?: string;
}

declare global {
  namespace Express {
    interface User extends AuthenticatedUser {}
    interface Request {
      id?: string;
      startTime?: number;
      user?: AuthenticatedUser;
      businessId?: string;
      businessRole?: UserRole;
      permissions?: string[];
    }
  }
}

export type AuthenticatedRequest = Request;
