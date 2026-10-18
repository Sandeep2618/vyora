import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { api } from '../lib/api';
import { UserProfile, BusinessProfile, AuthTokens, SubscriptionPlan, UserRole, UserWorkspace } from '../types';
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
  updateStaffPermissions: (permissions: Record<string, boolean>) => Promise<void>;
  myBusinesses: UserWorkspace[];
  isLoadingBusinesses: boolean;
  refreshMyBusinesses: () => Promise<void>;
  switchBusiness: (businessId: string) => Promise<void>;
  createStore: (data: any) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('vyora_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [myBusinesses, setMyBusinesses] = useState<UserWorkspace[]>([]);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshMyBusinesses = async () => {
    try {
      setIsLoadingBusinesses(true);
      let list: UserWorkspace[] = [];
      try {
        const res = await api.get<any>('/auth/businesses');
        list = Array.isArray(res) ? res : res?.data || [];
      } catch {
        const res = await api.get<any>('/auth/my-businesses');
        list = Array.isArray(res) ? res : res?.data || [];
      }
      setMyBusinesses(list);
    } catch (err) {
      console.warn('Could not refresh businesses list:', err);
    } finally {
      setIsLoadingBusinesses(false);
    }
  };

  const switchBusiness = async (businessId: string) => {
    try {
      setIsLoading(true);
      const res = await api.post<any>('/auth/switch-business', { businessId });
      if (res?.tokens?.accessToken) {
        localStorage.setItem('vyora_token', res.tokens.accessToken);
      }
      localStorage.setItem('vyora_business_id', businessId);

      await fetchBusinessProfile();
      await refreshMyBusinesses();
      window.location.reload();
    } catch (err) {
      console.error('Failed to switch workspace:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createStore = async (data: any) => {
    try {
      setIsLoading(true);
      const res = await api.post<any>('/business', data);
      const newBiz = res?.data || res;
      const newId = newBiz?.id || newBiz?._id;
      if (newId) {
        await switchBusiness(newId);
      }
      return newBiz;
    } catch (err) {
      console.error('Failed to create store:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

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
          await refreshMyBusinesses();
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

    if (data.user.email && !data.user.email.endsWith('@vyora.in')) {
      if (!localStorage.getItem('vyora_has_welcomed')) {
        api.post('/auth/welcome', {
          email: data.user.email,
          name: data.user.name,
        }).catch(() => {});
        localStorage.setItem('vyora_has_welcomed', 'true');
      }
    }
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

    if (data.user.email && !data.user.email.endsWith('@vyora.in')) {
      localStorage.setItem('vyora_has_welcomed', 'true');
    }
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
    // If user is Staff, check owner-configured staff permissions
    if (isStaff) {
      if (feature === 'ROLES') return false; // Staff never gets Roles & Rights management
      const perms = (business as any)?.staffPermissions;
      if (perms) {
        const modKey = feature.toLowerCase();
        if (perms[modKey] === false) return false;
      }
    }

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

  const updateStaffPermissions = async (permissions: Record<string, boolean>) => {
    const updated = await api.put<BusinessProfile>('/business/permissions', permissions);
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
        updateStaffPermissions,
        myBusinesses,
        isLoadingBusinesses,
        refreshMyBusinesses,
        switchBusiness,
        createStore,
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
