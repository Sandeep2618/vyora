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
      setAccessDeniedDetail({
        isOpen: true,
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
        <header className="h-14 sm:h-16 bg-white dark:bg-[#112322] border-b border-[#D7E5E2] dark:border-[#1E3B38] flex items-center justify-between px-3 sm:px-6 flex-shrink-0 z-20">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {/* Hamburger button visible ONLY on screen < 1024px */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden h-9 w-9 flex items-center justify-center rounded-xl text-[#123B3A] dark:text-[#F0FDFA] hover:bg-[#F4F8F7] dark:hover:bg-[#142B2A] border border-[#D7E5E2] dark:border-[#1E3B38] shrink-0 cursor-pointer shadow-2xs"
              aria-label="Toggle navigation drawer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Business Badge */}
            <div className="h-9 flex items-center gap-1.5 px-3 bg-[#F4F8F7] dark:bg-[#142B2A] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl text-xs font-semibold text-[#123B3A] dark:text-[#F0FDFA] shrink-0 shadow-2xs">
              <Building2 className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
              <span className="truncate max-w-[100px] sm:max-w-[160px]">
                {business?.name || 'My Business'}
              </span>
            </div>

            {/* Plan Badge */}
            <span
              className={cn(
                'hidden sm:inline-flex items-center h-9 px-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border shrink-0',
                plan === 'enterprise'
                  ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                  : plan === 'growth'
                  ? 'bg-teal-50 dark:bg-teal-950/40 text-[#0F766E] dark:text-[#14B8A6] border-[#A0D2CA] dark:border-[#1E4D49]'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
              )}
            >
              {plan === 'enterprise'
                ? t('plans.enterprise', { defaultValue: 'Business Pro' })
                : plan === 'growth'
                ? t('plans.growth', { defaultValue: 'Growth' })
                : t('plans.starter', { defaultValue: 'Starter' })}
            </span>

            {/* Mobile App Sync & QR Scanner Button */}
            <button
              onClick={() => setIsMobileModalOpen(true)}
              className="inline-flex items-center h-9 gap-1.5 px-3 bg-[#E6F4F2] dark:bg-[#142B2A] text-[#0F766E] dark:text-[#14B8A6] border border-[#A0D2CA] dark:border-[#1E4D49] rounded-xl text-xs font-bold hover:bg-[#D7EBE8] dark:hover:bg-[#1E3E3C] transition-colors shrink-0 shadow-2xs cursor-pointer"
              title="Connect mobile phone or download APK"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('actions.getMobileApp', { defaultValue: 'Get Mobile App' })}</span>
            </button>
          </div>

          {/* Right Header: Theme, Language & User Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="h-9 w-9 flex items-center justify-center rounded-xl text-[#123B3A] dark:text-[#F0FDFA] bg-white dark:bg-[#0D1C1B] hover:bg-[#F4F8F7] dark:hover:bg-[#142B2A] border border-[#D7E5E2] dark:border-[#1E3B38] transition-colors shrink-0 cursor-pointer shadow-2xs"
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
                className="h-9 flex items-center gap-2 px-2.5 rounded-xl bg-white dark:bg-[#0D1C1B] hover:bg-[#F4F8F7] dark:hover:bg-[#142B2A] text-left transition-colors border border-[#D7E5E2] dark:border-[#1E3B38] cursor-pointer shadow-2xs"
              >
                <div className="w-6 h-6 rounded-lg bg-[#E6F4F2] dark:bg-[#142B2A] text-[#0F766E] dark:text-[#14B8A6] border border-[#A0D2CA] dark:border-[#1E4D49] flex items-center justify-center font-bold text-xs shrink-0">
                  {user?.name?.slice(0, 1).toUpperCase()}
                </div>
                <div className="hidden md:block text-left leading-tight">
                  <p className="text-xs font-bold text-[#123B3A] dark:text-[#F0FDFA] truncate max-w-[100px]">{user?.name}</p>
                  <p className="text-[10px] text-[#566B69] dark:text-[#8FA8A4] truncate max-w-[100px]">{business?.city || 'India'}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#566B69] dark:text-[#8FA8A4]" />
              </button>

              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl shadow-lg py-1 z-50 animate-in fade-in">
                    <div className="px-4 py-2 border-b border-[#D7E5E2] dark:border-[#1E3B38]">
                      <p className="text-xs font-semibold text-[#123B3A] dark:text-[#F0FDFA] truncate">{user?.name}</p>
                      <p className="text-[10px] text-[#566B69] dark:text-[#8FA8A4] truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        navigate('/account?tab=PROFILE');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#123B3A] dark:text-[#F0FDFA] hover:bg-[#F4F8F7] dark:hover:bg-[#142B2A] flex items-center gap-2 cursor-pointer"
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
                        className="w-full text-left px-4 py-2 text-xs text-[#123B3A] dark:text-[#F0FDFA] hover:bg-[#F4F8F7] dark:hover:bg-[#142B2A] flex items-center gap-2 cursor-pointer"
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
                        className="w-full text-left px-4 py-2 text-xs text-[#123B3A] dark:text-[#F0FDFA] hover:bg-[#F4F8F7] dark:hover:bg-[#142B2A] flex items-center gap-2 cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                        {t('actions.billingAndPlans', { defaultValue: 'Billing & Plans' })}
                      </button>
                    )}
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-xs text-[#B91C1C] dark:text-rose-400 hover:bg-[#FEE2E2] dark:hover:bg-rose-950/40 flex items-center gap-2 border-t border-[#D7E5E2] dark:border-[#1E3B38] mt-1 cursor-pointer"
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
