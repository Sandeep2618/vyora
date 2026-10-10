import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';
import { UserProfile, BusinessProfile, AuthTokens } from '@vyora/shared-types';
import { LoginInput, RegisterInput } from '@vyora/validation';

interface AuthContextType {
  user: UserProfile | null;
  business: BusinessProfile | null;
  isLoading: boolean;
  login: (credentials: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => void;
  refreshBusiness: () => Promise<void>;
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
      const b = await api.get<BusinessProfile>('/business/current');
      setBusiness(b);
      localStorage.setItem('vyora_business_id', b.id);
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
    if (data.user.businessId) {
      localStorage.setItem('vyora_business_id', data.user.businessId);
    }
    setUser(data.user);
    await fetchBusinessProfile();
  };

  const register = async (input: RegisterInput) => {
    const data = await api.post<AuthTokens>('/auth/register', input);
    localStorage.setItem('vyora_token', data.accessToken);
    localStorage.setItem('vyora_user', JSON.stringify(data.user));
    if (data.user.businessId) {
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

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        isLoading,
        login,
        register,
        logout,
        refreshBusiness,
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
