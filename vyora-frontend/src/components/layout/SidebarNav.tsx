import React from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

export interface NavItem {
  label: string;
  icon: any;
  path: string;
}

interface SidebarNavProps {
  navItems: NavItem[];
  isMobileDrawer?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  navItems,
  isMobileDrawer = false,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { user, isOwner, plan, logout } = useAuth();
  const { t } = useTranslation('common');

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#112322] text-[#123B3A] dark:text-[#F0FDFA] select-none">
      {/* Brand Header */}
      <div
        className={cn(
          'border-b border-[#D7E5E2] dark:border-[#1E3B38] flex items-center transition-all duration-200',
          isCollapsed ? 'p-3 justify-center flex-col gap-2' : 'px-4 py-3.5 justify-between',
        )}
      >
        <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center')}>
          <div className="w-9 h-9 rounded-xl bg-[#0F766E] flex items-center justify-center shadow-xs shrink-0">
            <span className="text-white font-black text-xl tracking-tighter">V</span>
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className="text-lg font-bold tracking-tight text-[#123B3A] dark:text-[#F0FDFA] leading-tight truncate">
                Vyora
              </h1>
              <p className="text-[10px] text-[#566B69] dark:text-[#A0BDB8] font-medium truncate">
                {t('appTagline')}
              </p>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        {isMobileDrawer && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-[#566B69] dark:text-[#A0BDB8] hover:text-[#123B3A] dark:hover:text-white hover:bg-[#F4F8F7] dark:hover:bg-[#162E2D] transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Desktop collapse toggle button */}
        {!isMobileDrawer && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className={cn(
              'p-1.5 rounded-lg text-[#566B69] dark:text-[#A0BDB8] hover:text-[#123B3A] dark:hover:text-white hover:bg-[#F4F8F7] dark:hover:bg-[#162E2D] border border-[#D7E5E2] dark:border-[#1E3B38] transition-colors cursor-pointer shrink-0',
              isCollapsed && 'w-8 h-8 flex items-center justify-center p-0',
            )}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className={cn('flex-1 py-3 space-y-1 overflow-y-auto', isCollapsed ? 'px-2' : 'px-3')}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            title={isCollapsed ? item.label : undefined}
            onClick={() => isMobileDrawer && onCloseMobile?.()}
            className={({ isActive }: { isActive: boolean }) =>
              cn(
                'flex items-center rounded-xl text-xs font-semibold transition-all group relative',
                isCollapsed ? 'justify-center p-2.5 my-1' : 'gap-3 px-3.5 py-2.5',
                isActive
                  ? 'bg-[#0F766E] text-white shadow-xs font-bold'
                  : 'text-[#4A6360] dark:text-[#A0BDB8] hover:bg-[#F4F8F7] dark:hover:bg-[#162E2D] hover:text-[#123B3A] dark:hover:text-[#F0FDFA]',
              )
            }
          >
            <item.icon className={cn('w-4 h-4 shrink-0', isCollapsed && 'w-5 h-5')} />
            {!isCollapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Plan Card (Shown only when expanded) */}
      {!isCollapsed && (
        <div className="p-3 mx-3 mb-3 bg-[#F4F8F7] dark:bg-[#162E2D] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-[#123B3A] dark:text-[#F0FDFA] text-[11px] uppercase tracking-wider">
              {plan === 'enterprise'
                ? t('plans.enterprise', { defaultValue: 'Business Pro' })
                : plan === 'growth'
                ? t('plans.growth', { defaultValue: 'Growth Plan' })
                : t('plans.starter', { defaultValue: 'Starter Free' })}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#0F766E] text-white">
              {plan === 'enterprise'
                ? t('plans.proBadge', { defaultValue: 'PRO' })
                : plan === 'growth'
                ? t('plans.activeBadge', { defaultValue: 'ACTIVE' })
                : t('plans.freeBadge', { defaultValue: 'FREE' })}
            </span>
          </div>
          <p className="text-[#566B69] dark:text-[#A0BDB8] text-[11px] leading-relaxed">
            {plan === 'enterprise'
              ? t('plans.enterpriseDesc', { defaultValue: 'Unlimited staff, audited stock' })
              : plan === 'growth'
              ? t('plans.growthDesc', { defaultValue: 'Up to 3 staff, purchases & reports' })
              : t('plans.starterDesc', { defaultValue: 'Basic invoices (50/mo), 1 owner' })}
          </p>
        </div>
      )}

      {/* User Info / Logout */}
      <div
        className={cn(
          'border-t border-[#D7E5E2] dark:border-[#1E3B38] flex items-center bg-white dark:bg-[#112322] transition-all',
          isCollapsed ? 'p-2 flex-col gap-2 justify-center' : 'px-3.5 py-3 justify-between',
        )}
      >
        <div className={cn('flex items-center gap-2.5 overflow-hidden', isCollapsed && 'justify-center')}>
          <div
            className="w-8 h-8 rounded-full bg-[#0F766E] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs"
            title={user?.name || 'User'}
          >
            {user?.name?.slice(0, 2).toUpperCase() || 'US'}
          </div>
          {!isCollapsed && (
            <div className="truncate min-w-0">
              <p className="text-xs font-bold text-[#123B3A] dark:text-[#F0FDFA] truncate">{user?.name}</p>
              <p className="text-[10px] text-[#566B69] dark:text-[#A0BDB8] uppercase font-bold truncate">
                {isOwner
                  ? t('roles.ownerShort', { defaultValue: 'OWNER (Full Access)' })
                  : t('roles.staffShort', { defaultValue: 'STAFF (View Only)' })}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={logout}
          title={t('actions.signOut', { defaultValue: 'Log out' })}
          className="p-1.5 text-[#566B69] dark:text-[#A0BDB8] hover:text-[#B91C1C] dark:hover:text-rose-400 hover:bg-[#F4F8F7] dark:hover:bg-[#162E2D] rounded-lg transition-colors cursor-pointer shrink-0"
          aria-label={t('actions.signOut', { defaultValue: 'Log out' })}
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
