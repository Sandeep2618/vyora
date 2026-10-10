import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { api } from '../lib/api';
import { UserProfile, BusinessProfile, AuthTokens, SubscriptionPlan, UserRole } from '../types';
import { LoginInput, RegisterInput } from '@vyora/validation';

export type FeatureKey =
  | 'INVOICES'
  | 'PRODUCTS'
  | 'PARTIES'
  | 'INVENTORY'
  | 'PURCHASES'
  | 'PAYMENTS'
  | 'REPORTS'
  | 'ROLES'
  | 'STOCK_ADJUSTMENTS';

interface AuthContextType {
  user: UserProfile | null;
  business: BusinessProfile | null;
  isLoading: boolean;
  isOwner: boolean;
  isStaff: boolean;
  role: UserRole;
  plan: SubscriptionPlan;
  hasFeature: (feature: FeatureKey) => boolean;
  login: (credentials: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => void;
  refreshBusiness: () => Promise<void>;
  updateSubscriptionPlan: (plan: SubscriptionPlan) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('vyora_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchBusinessProfile = async () => {
    try {
      const b = await api.get<any>('/business/current');
      setBusiness(b);
      const bizId = b?.id || b?._id;
      if (bizId && bizId !== 'undefined' && bizId !== 'null') {
        localStorage.setItem('vyora_business_id', bizId);
      }
    } catch {
      setBusiness(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('vyora_token');
      if (token) {
        try {
          const profile = await api.get<UserProfile>('/auth/me');
          setUser(profile);
          localStorage.setItem('vyora_user', JSON.stringify(profile));
          await fetchBusinessProfile();
        } catch {
          localStorage.removeItem('vyora_token');
          localStorage.removeItem('vyora_user');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginInput) => {
    const data = await api.post<AuthTokens>('/auth/login', credentials);
    localStorage.setItem('vyora_token', data.accessToken);
    localStorage.setItem('vyora_user', JSON.stringify(data.user));
    if (data.user.businessId && data.user.businessId !== 'undefined' && data.user.businessId !== 'null') {
      localStorage.setItem('vyora_business_id', data.user.businessId);
    }
    setUser(data.user);
    await fetchBusinessProfile();
  };

  const register = async (input: RegisterInput) => {
    const data = await api.post<AuthTokens>('/auth/register', input);
    localStorage.setItem('vyora_token', data.accessToken);
    localStorage.setItem('vyora_user', JSON.stringify(data.user));
    if (data.user.businessId && data.user.businessId !== 'undefined' && data.user.businessId !== 'null') {
      localStorage.setItem('vyora_business_id', data.user.businessId);
    }
    setUser(data.user);
    await fetchBusinessProfile();
  };

  const logout = () => {
    localStorage.removeItem('vyora_token');
    localStorage.removeItem('vyora_user');
    localStorage.removeItem('vyora_business_id');
    setUser(null);
    setBusiness(null);
    window.location.href = '/login';
  };

  const refreshBusiness = async () => {
    await fetchBusinessProfile();
  };

  const role: UserRole = user?.role || 'STAFF';
  const isOwner = role === 'OWNER' || role === 'ADMIN';
  const isStaff = !isOwner;
  const plan: SubscriptionPlan = (business?.subscriptionPlan as SubscriptionPlan) || 'growth';

  const hasFeature = (feature: FeatureKey): boolean => {
    switch (feature) {
      case 'INVOICES':
      case 'PRODUCTS':
      case 'PARTIES':
      case 'INVENTORY':
        return true;
      case 'PURCHASES':
      case 'PAYMENTS':
      case 'REPORTS':
      case 'ROLES':
        return plan === 'growth' || plan === 'enterprise';
      case 'STOCK_ADJUSTMENTS':
        return plan === 'enterprise';
      default:
        return true;
    }
  };

  const updateSubscriptionPlan = async (newPlan: SubscriptionPlan) => {
    const updated = await api.put<BusinessProfile>('/business/plan', { plan: newPlan });
    setBusiness(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        isLoading,
        isOwner,
        isStaff,
        role,
        plan,
        hasFeature,
        login,
        register,
        logout,
        refreshBusiness,
        updateSubscriptionPlan,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
