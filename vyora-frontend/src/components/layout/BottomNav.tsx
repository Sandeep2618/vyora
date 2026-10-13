import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Package, Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

interface BottomNavProps {
  isMobileMenuOpen: boolean;
  onOpenMobileMenu: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ isMobileMenuOpen, onOpenMobileMenu }) => {
  const { t } = useTranslation('common');

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-[#112322]/95 backdrop-blur-md border-t border-[#D7E5E2] dark:border-[#1E3B38] px-2 py-1.5 flex items-center justify-around lg:hidden shadow-lg">
      <NavLink
        to="/"
        end
        className={({ isActive }: { isActive: boolean }) =>
          cn(
            'flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors',
            isActive ? 'text-[#0F766E] dark:text-[#14B8A6]' : 'text-[#566B69] dark:text-[#8FA8A4] hover:text-[#123B3A] dark:hover:text-[#F0FDFA]',
          )
        }
      >
        <LayoutDashboard className="w-5 h-5 mb-0.5" />
        <span>{t('navigation.dashboard')}</span>
      </NavLink>

      <NavLink
        to="/invoices"
        className={({ isActive }: { isActive: boolean }) =>
          cn(
            'flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors',
            isActive ? 'text-[#0F766E] dark:text-[#14B8A6]' : 'text-[#566B69] dark:text-[#8FA8A4] hover:text-[#123B3A] dark:hover:text-[#F0FDFA]',
          )
        }
      >
        <FileText className="w-5 h-5 mb-0.5" />
        <span>{t('navigation.invoices')}</span>
      </NavLink>

      <NavLink
        to="/parties"
        className={({ isActive }: { isActive: boolean }) =>
          cn(
            'flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors',
            isActive ? 'text-[#0F766E] dark:text-[#14B8A6]' : 'text-[#566B69] dark:text-[#8FA8A4] hover:text-[#123B3A] dark:hover:text-[#F0FDFA]',
          )
        }
      >
        <Users className="w-5 h-5 mb-0.5" />
        <span>{t('navigation.parties')}</span>
      </NavLink>

      <NavLink
        to="/products"
        className={({ isActive }: { isActive: boolean }) =>
          cn(
            'flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors',
            isActive ? 'text-[#0F766E] dark:text-[#14B8A6]' : 'text-[#566B69] dark:text-[#8FA8A4] hover:text-[#123B3A] dark:hover:text-[#F0FDFA]',
          )
        }
      >
        <Package className="w-5 h-5 mb-0.5" />
        <span>{t('navigation.products')}</span>
      </NavLink>

      <button
        type="button"
        onClick={onOpenMobileMenu}
        className={cn(
          'flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold text-[#566B69] dark:text-[#8FA8A4] hover:text-[#123B3A] dark:hover:text-[#F0FDFA] transition-colors cursor-pointer',
          isMobileMenuOpen && 'text-[#0F766E] dark:text-[#14B8A6]',
        )}
      >
        <Menu className="w-5 h-5 mb-0.5" />
        <span>{t('navigation.menu')}</span>
      </button>
    </nav>
  );
};
