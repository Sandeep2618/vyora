import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  ArrowLeftRight,
  ShoppingCart,
  CreditCard,
  BarChart3,
  LogOut,
  Building2,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  Smartphone,
  Sun,
  Moon,
  Receipt,
} from 'lucide-react';
import { useAuth, FeatureKey } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { SidebarNav, NavItem } from './SidebarNav';
import { BottomNav } from './BottomNav';
import { MobileAppModal } from './MobileAppModal';
import { LanguageDropdown } from './LanguageDropdown';
import { AccessDeniedModal } from '../ui/AccessDeniedModal';
import { StoreSwitcherDropdown } from './StoreSwitcherDropdown';
import { PlanPurchaseModal } from '@/components/subscription/modal/PlanPurchaseModal';

export const AppLayout: React.FC = () => {
  const { user, business, logout, isOwner, plan, hasFeature } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { t } = useTranslation('common');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('vyora_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [accessDeniedDetail, setAccessDeniedDetail] = useState<{
    isOpen: boolean;
    title?: string;
    message?: string;
    requiredRole?: string;
    requiredPlan?: string;
    type?: 'PLAN_RESTRICTION' | 'ROLE_RESTRICTION';
    errorType?: string;
  }>({ isOpen: false });

  const navigate = useNavigate();

  const isPlanExpired =
    business?.subscriptionStatus === 'expired' ||
    Boolean(
      business?.subscriptionExpiresAt &&
        new Date(business.subscriptionExpiresAt).getTime() < Date.now(),
    );

  useEffect(() => {
    const handleForbidden = (e: Event) => {
      const customEvent = e as CustomEvent;
      const detail = customEvent.detail;
      const isPlan = detail?.error === 'PlanLimitExceeded' || detail?.error === 'PlanExpired';
      setAccessDeniedDetail({
        isOpen: true,
        type: isPlan ? 'PLAN_RESTRICTION' : 'ROLE_RESTRICTION',
        requiredPlan: detail?.requiredPlan || (isPlan ? 'growth' : undefined),
        title:
          detail?.error === 'PlanLimitExceeded'
            ? 'Plan Upgrade Required'
            : detail?.error === 'PlanExpired'
            ? 'Subscription Plan Expired'
            : 'Access Restricted',
        message: detail?.message,
        requiredRole: detail?.requiredRoles
          ? detail.requiredRoles.join(' or ')
          : undefined,
        errorType: detail?.error,
      });
    };

    window.addEventListener('vyora:forbidden', handleForbidden);
    return () => {
      window.removeEventListener('vyora:forbidden', handleForbidden);
    };
  }, []);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('vyora_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const isStarter = plan === 'starter';
  const isStaff = user?.role === 'STAFF';

  const allNavItems: (NavItem & { feature?: FeatureKey })[] = [
    { label: t('navigation.dashboard', { defaultValue: 'Dashboard' }), icon: LayoutDashboard, path: '/' },
    { label: t('navigation.invoices', { defaultValue: 'Invoices' }), icon: FileText, path: '/invoices', feature: 'INVOICES' },
    { label: t('navigation.customers', { defaultValue: 'Customers' }), icon: Users, path: '/parties', feature: 'PARTIES' },
    { label: t('navigation.products', { defaultValue: 'Products' }), icon: Package, path: '/products', feature: 'PRODUCTS' },
    { label: t('navigation.inventory', { defaultValue: 'Inventory' }), icon: ArrowLeftRight, path: '/inventory', feature: 'INVENTORY' },
    { label: t('navigation.purchase', { defaultValue: 'Purchase' }), icon: ShoppingCart, path: '/purchases', feature: 'PURCHASES' },
    { label: t('navigation.payments', { defaultValue: 'Payments' }), icon: CreditCard, path: '/payments', feature: 'PAYMENTS' },
    { label: t('navigation.expenses', { defaultValue: 'Expenses' }), icon: Receipt, path: '/expenses' },
    { label: t('navigation.reports', { defaultValue: 'Reports' }), icon: BarChart3, path: '/reports', feature: 'REPORTS' },
    { label: t('navigation.account', { defaultValue: 'Account & Roles' }), icon: ShieldCheck, path: '/account' },
  ];

  const navItems = allNavItems.filter((item) => {
    if (item.path === '/reports' && (isStarter || isStaff)) return false;
    if (item.path === '/purchases' && isStaff) return false;
    if (item.path === '/account' && isStaff) return false;
    if (item.feature && !hasFeature(item.feature)) return false;
    return true;
  });

  return (
    <div className="flex h-screen bg-[#F4F8F7] dark:bg-[#0A1615] overflow-hidden">
      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile / Tablet Drawer Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-[#112322] border-r border-[#D7E5E2] dark:border-[#1E3B38] text-[#123B3A] dark:text-[#F0FDFA] flex flex-col transition-transform duration-300 ease-in-out lg:hidden shadow-2xl',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <SidebarNav
          navItems={navItems}
          isMobileDrawer
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />
      </aside>

      {/* Desktop Sidebar - Header matched theme with collapsible mini-mode */}
      <aside
        className={cn(
          'hidden lg:flex flex-col bg-white dark:bg-[#112322] border-r border-[#D7E5E2] dark:border-[#1E3B38] text-[#123B3A] dark:text-[#F0FDFA] flex-shrink-0 z-30 select-none transition-all duration-300 ease-in-out',
          isSidebarCollapsed ? 'w-18' : 'w-64',
        )}
      >
        <SidebarNav
          navItems={navItems}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-14 sm:h-16 bg-white dark:bg-[#112322] border-b border-[#D7E5E2] dark:border-[#1E3B38] flex items-center justify-between px-3.5 sm:px-6 flex-shrink-0 z-20">
          <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
            {/* Hamburger button visible ONLY on screen < 1024px */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden h-9 w-9 flex items-center justify-center rounded-xl text-[#123B3A] dark:text-[#F0FDFA] hover:bg-[#F4F8F7] dark:hover:bg-[#142B2A] border border-[#D7E5E2] dark:border-[#1E3B38] shrink-0 cursor-pointer shadow-2xs"
              aria-label="Toggle navigation drawer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Interactive Multi-Store Switcher Dropdown */}
            <StoreSwitcherDropdown />
          </div>

          {/* Right Header: Theme, Language & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="h-9 w-9 flex items-center justify-center rounded-xl text-[#566B69] dark:text-[#8FA8A4] hover:text-[#123B3A] dark:hover:text-[#F0FDFA] bg-[#F4F8F7]/80 dark:bg-[#0D1C1B] hover:bg-[#E6F0EE] dark:hover:bg-[#142B2A] border border-[#D7E5E2] dark:border-[#1E3B38] transition-colors shrink-0 cursor-pointer shadow-2xs"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#0F766E]" />}
            </button>

            {/* Language Dropdown (EN / हिन्दी / ગુજરાતી) */}
            <LanguageDropdown />

            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="h-9 flex items-center gap-2 px-2.5 rounded-xl bg-[#F4F8F7]/80 dark:bg-[#0D1C1B] hover:bg-[#E6F0EE] dark:hover:bg-[#142B2A] text-left transition-colors border border-[#D7E5E2] dark:border-[#1E3B38] cursor-pointer shadow-2xs"
              >
                <div className="w-6 h-6 rounded-lg bg-[#0F766E] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  {user?.name?.slice(0, 1).toUpperCase()}
                </div>
                <div className="hidden md:block text-left leading-tight">
                  <p className="text-xs font-bold text-[#123B3A] dark:text-[#F0FDFA] truncate max-w-[120px]">{user?.name}</p>
                  <p className="text-[10px] text-[#566B69] dark:text-[#8FA8A4] truncate max-w-[120px]">{business?.city || 'India'}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#566B69] dark:text-[#8FA8A4]" />
              </button>

              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2.5 border-b border-[#D7E5E2] dark:border-[#1E3B38]">
                      <p className="text-xs font-bold text-[#123B3A] dark:text-[#F0FDFA] truncate">{user?.name}</p>
                      <p className="text-[10px] text-[#566B69] dark:text-[#8FA8A4] truncate">{user?.email}</p>
                      <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#0F766E]/10 text-[#0F766E] dark:text-[#14B8A6]">
                        {plan === 'enterprise' ? 'Business Pro' : plan === 'growth' ? 'Growth Plan' : 'Starter Plan'}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        navigate('/account?tab=PROFILE');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#123B3A] dark:text-[#F0FDFA] hover:bg-[#F4F8F7] dark:hover:bg-[#142B2A] flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Building2 className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                      {t('actions.businessProfile', { defaultValue: 'Business Profile' })}
                    </button>
                    {isOwner && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate('/account?tab=ROLES');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#123B3A] dark:text-[#F0FDFA] hover:bg-[#F4F8F7] dark:hover:bg-[#142B2A] flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                        {t('actions.rolesAndPermissions', { defaultValue: 'Roles & Staff' })}
                      </button>
                    )}
                    {isOwner && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate('/account?tab=BILLING');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#123B3A] dark:text-[#F0FDFA] hover:bg-[#F4F8F7] dark:hover:bg-[#142B2A] flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                        {t('actions.billingAndPlans', { defaultValue: 'Billing & Plans' })}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsMobileModalOpen(true);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#123B3A] dark:text-[#F0FDFA] hover:bg-[#F4F8F7] dark:hover:bg-[#142B2A] flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                      {t('actions.getMobileApp', { defaultValue: 'Get Mobile App' })}
                    </button>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-xs text-[#B91C1C] dark:text-rose-400 hover:bg-[#FEE2E2] dark:hover:bg-rose-950/40 flex items-center gap-2 border-t border-[#D7E5E2] dark:border-[#1E3B38] mt-1 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      {t('actions.signOut', { defaultValue: 'Sign Out' })}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Work Area */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 lg:p-6 pb-20 lg:pb-6 bg-[#F4F8F7] dark:bg-[#0A1615]">
          {isPlanExpired && (
            <div className="mb-4 p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-[#123B3A] dark:text-[#F0FDFA]">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">⚠️</span>
                <div>
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                    Subscription Plan Expired
                  </h4>
                  <p className="text-xs text-[#566B69] dark:text-[#A0BDB8]">
                    {isOwner
                      ? 'Your subscription period has ended. Renew now via Bharat UPI to unlock full business features.'
                      : `The workspace plan has expired. Please contact store owner ${business?.ownerName || 'the owner'}${business?.ownerPhone ? ` (${business.ownerPhone})` : ''} to renew.`}
                  </p>
                </div>
              </div>
              {isOwner && (
                <button
                  onClick={() => setIsPurchaseModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#0D665F] text-white text-xs font-bold shrink-0 transition-colors cursor-pointer shadow-2xs"
                >
                  Renew via UPI
                </button>
              )}
            </div>
          )}
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation Bar (< 1024px) */}
        <BottomNav
          isMobileMenuOpen={isMobileMenuOpen}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />
      </div>

      {/* Mobile App QR & Connection Modal */}
      <MobileAppModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
      />

      {/* 403 Forbidden Access Denied Modal */}
      <AccessDeniedModal
        isOpen={accessDeniedDetail.isOpen}
        onClose={() => setAccessDeniedDetail({ isOpen: false })}
        title={accessDeniedDetail.title}
        message={accessDeniedDetail.message}
        requiredRole={accessDeniedDetail.requiredRole}
        requiredPlan={accessDeniedDetail.requiredPlan}
        type={accessDeniedDetail.type}
        errorType={accessDeniedDetail.errorType}
        onUpgrade={() => setIsPurchaseModalOpen(true)}
      />

      {/* Plan Purchase UPI Modal for Owner */}
      {isOwner && (
        <PlanPurchaseModal
          isOpen={isPurchaseModalOpen}
          onClose={() => setIsPurchaseModalOpen(false)}
          targetPlan="growth"
        />
      )}
    </div>
  );
};
