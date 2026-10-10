import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  ArrowLeftRight,
  ShoppingCart,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Building2,
  Menu,
  X,
  ChevronDown,
  Globe,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

export const AppLayout: React.FC = () => {
  const { user, business, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Invoices', icon: FileText, path: '/invoices' },
    { label: 'Customers', icon: Users, path: '/parties' },
    { label: 'Products', icon: Package, path: '/products' },
    { label: 'Inventory', icon: ArrowLeftRight, path: '/inventory' },
    { label: 'Purchase', icon: ShoppingCart, path: '/purchases' },
    { label: 'Payments', icon: CreditCard, path: '/payments' },
    { label: 'Reports', icon: BarChart3, path: '/reports' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="flex h-screen bg-[#F4F8F7] overflow-hidden">
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
          'fixed inset-y-0 left-0 z-50 w-72 bg-[#123B3A] text-white flex flex-col transition-transform duration-300 ease-in-out lg:hidden shadow-2xl',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="px-5 py-4 border-b border-[#1A4F4E]/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#0F766E] flex items-center justify-center shadow-md">
              <span className="text-white font-black text-lg">V</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-none">Vyora</h1>
              <p className="text-[10px] text-[#A0BDB8] mt-0.5">Billing & Inventory</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 rounded-lg text-[#A0BDB8] hover:text-white hover:bg-[#1A4F4E] transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#0F766E] text-white shadow-xs font-semibold'
                    : 'text-[#D7E5E2] hover:bg-[#1A4F4E] hover:text-white',
                )
              }
            >
              <item.icon className="w-4 h-4 opacity-90" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 mx-3 mb-3 bg-[#0D2D2C] border border-[#1A4F4E] rounded-xl text-xs">
          <p className="text-[#A0BDB8] text-[11px]">
            {business?.name || 'Vyora App'} • {business?.currency || 'INR'}
          </p>
        </div>

        <div className="px-4 py-3 border-t border-[#1A4F4E]/60 flex items-center justify-between bg-[#0E3130]">
          <div className="truncate pr-2">
            <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-[#A0BDB8] uppercase">{user?.role || 'OWNER'}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-[#A0BDB8] hover:text-white hover:bg-[#1A4F4E] rounded-md transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Desktop Sidebar (Theme B - Deep Navigation #123B3A) - ONLY on large desktop >= 1024px */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#123B3A] text-white flex-shrink-0 z-30 select-none">
        {/* Brand Header */}
        <div className="px-6 py-5 border-b border-[#1A4F4E]/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0F766E] flex items-center justify-center shadow-md">
              <span className="text-white font-black text-xl tracking-tighter">V</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white leading-none">Vyora</h1>
              <p className="text-[10px] text-[#A0BDB8] mt-1 font-medium">Simple Business. Bigger Dreams.</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#0F766E] text-white shadow-sm font-semibold'
                    : 'text-[#D7E5E2] hover:bg-[#1A4F4E] hover:text-white',
                )
              }
            >
              <item.icon className="w-4 h-4 opacity-90" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Pro Banner Card */}
        <div className="p-3 mx-3 mb-3 bg-[#0D2D2C] border border-[#1A4F4E] rounded-xl text-xs">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-[#0F766E] animate-pulse" />
            <span className="font-semibold text-white">Theme B: Teal Ledger</span>
          </div>
          <p className="text-[#A0BDB8] text-[11px] leading-relaxed">
            Standard Edition • {business?.currency || 'INR'} Minor Unit Precision
          </p>
        </div>

        {/* User Info / Logout */}
        <div className="px-4 py-3 border-t border-[#1A4F4E]/60 flex items-center justify-between bg-[#0E3130]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#0F766E] text-white flex items-center justify-center font-bold text-xs">
              {user?.name?.slice(0, 2).toUpperCase() || 'US'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-[#A0BDB8] uppercase">{user?.role || 'OWNER'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 text-[#A0BDB8] hover:text-white hover:bg-[#1A4F4E] rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-14 sm:h-16 bg-white border-b border-[#D7E5E2] flex items-center justify-between px-3 sm:px-6 flex-shrink-0 z-20">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {/* Hamburger button visible on any screen smaller than lg (1024px) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#123B3A] hover:bg-[#F4F8F7] border border-[#D7E5E2] shrink-0"
              aria-label="Toggle navigation drawer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Business Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F4F8F7] border border-[#D7E5E2] rounded-lg text-xs font-semibold text-[#123B3A] shrink-0">
              <Building2 className="w-3.5 h-3.5 text-[#0F766E]" />
              <span className="truncate max-w-[120px] sm:max-w-[180px]">
                {business?.name || 'My Business'}
              </span>
            </div>
          </div>

          {/* Right Header: Marketing Website Link & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0F766E] bg-[#E6F4F2] border border-[#D7E5E2] hover:bg-[#D1ECE8] transition-colors"
              title="Visit Vyora Marketing Website"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Marketing Site</span>
            </a>

            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 sm:gap-2 p-1 rounded-xl hover:bg-[#F4F8F7] text-left transition-colors border border-transparent hover:border-[#D7E5E2]"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#E6F4F2] text-[#0F766E] border border-[#D7E5E2] flex items-center justify-center font-bold text-xs shrink-0">
                  {user?.name?.slice(0, 1).toUpperCase()}
                </div>
                <div className="hidden md:block text-left leading-tight">
                  <p className="text-xs font-bold text-[#123B3A]">{user?.name}</p>
                  <p className="text-[10px] text-[#566B69]">{business?.city || 'India'}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#566B69]" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#D7E5E2] rounded-xl shadow-lg py-1 z-50 animate-in fade-in">
                  <div className="px-4 py-2 border-b border-[#D7E5E2]">
                    <p className="text-xs font-semibold text-[#123B3A] truncate">{user?.name}</p>
                    <p className="text-[10px] text-[#566B69] truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      navigate('/settings');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-[#123B3A] hover:bg-[#F4F8F7] flex items-center gap-2"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Business Settings
                  </button>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-xs text-[#B91C1C] hover:bg-[#FEE2E2] flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Work Area */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 lg:p-6 pb-20 lg:pb-6 bg-[#F4F8F7]">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation Bar (Fixed for fast thumb access on mobile devices < 1024px) */}
        <nav className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#D7E5E2] px-2 py-1.5 flex items-center justify-around lg:hidden shadow-lg">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors',
                isActive ? 'text-[#0F766E]' : 'text-[#566B69] hover:text-[#123B3A]',
              )
            }
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/invoices"
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors',
                isActive ? 'text-[#0F766E]' : 'text-[#566B69] hover:text-[#123B3A]',
              )
            }
          >
            <FileText className="w-5 h-5 mb-0.5" />
            <span>Invoices</span>
          </NavLink>

          <NavLink
            to="/parties"
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors',
                isActive ? 'text-[#0F766E]' : 'text-[#566B69] hover:text-[#123B3A]',
              )
            }
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span>Parties</span>
          </NavLink>

          <NavLink
            to="/products"
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors',
                isActive ? 'text-[#0F766E]' : 'text-[#566B69] hover:text-[#123B3A]',
              )
            }
          >
            <Package className="w-5 h-5 mb-0.5" />
            <span>Products</span>
          </NavLink>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className={cn(
              'flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold text-[#566B69] hover:text-[#123B3A] transition-colors',
              isMobileMenuOpen && 'text-[#0F766E]',
            )}
          >
            <Menu className="w-5 h-5 mb-0.5" />
            <span>Menu</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
