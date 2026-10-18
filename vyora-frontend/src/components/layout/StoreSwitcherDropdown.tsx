import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  ChevronDown,
  Check,
  Plus,
  Sparkles,
  MapPin,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CreateStoreModal } from './CreateStoreModal';
import { Button } from '../ui/Button';

export const StoreSwitcherDropdown: React.FC = () => {
  const { business, user, plan, isOwner, myBusinesses, switchBusiness, isLoadingBusinesses } =
    useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const [isOpen, setIsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isStarter = plan === 'starter';
  const isLimitReached = isStarter && myBusinesses.length >= 2;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectBusiness = async (bizId: string) => {
    if (!bizId || bizId === business?.id) {
      setIsOpen(false);
      return;
    }
    try {
      setSwitchingId(bizId);
      await switchBusiness(bizId);
      setIsOpen(false);
    } catch {
      // Handled in context
    } finally {
      setSwitchingId(null);
    }
  };

  const currentStoreName = business?.name || 'Vyora Store';

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      {/* Trigger Button replacing static badge */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 flex items-center gap-2 px-2.5 sm:px-3 bg-[#F4F8F7]/80 dark:bg-[#0D1C1B] hover:bg-[#E6F0EE] dark:hover:bg-[#142B2A] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl text-xs font-semibold text-[#123B3A] dark:text-[#F0FDFA] transition-all shadow-2xs cursor-pointer select-none"
        title="Switch store workspace"
      >
        <div className="w-5 h-5 rounded-md bg-[#0F766E]/10 dark:bg-[#0F766E]/25 text-[#0F766E] dark:text-[#14B8A6] flex items-center justify-center shrink-0">
          <Building2 className="w-3 h-3" />
        </div>
        <span className="truncate max-w-[110px] sm:max-w-[160px] font-bold">
          {currentStoreName}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#566B69] dark:text-[#8FA8A4] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="p-3.5 border-b border-[#D7E5E2] dark:border-[#1E3B38] bg-[#F4F8F7]/60 dark:bg-[#142B2A]/60 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-[#123B3A] dark:text-[#F0FDFA]">
                Store Workspaces
              </h4>
              <p className="text-[11px] text-[#566B69] dark:text-[#8FA8A4]">
                Manage separate stock & billing
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0F766E]/10 dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-[#14B8A6] border border-[#0F766E]/20">
              {myBusinesses.length || 1} Store{myBusinesses.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* List of Stores */}
          <div className="max-h-60 overflow-y-auto divide-y divide-[#D7E5E2]/60 dark:divide-[#1E3B38]/60 p-1">
            {isLoadingBusinesses ? (
              <div className="p-4 text-center text-xs text-[#566B69] dark:text-[#8FA8A4]">
                <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1 text-[#0F766E]" />
                Loading stores...
              </div>
            ) : myBusinesses.length > 0 ? (
              myBusinesses.map((b) => {
                const targetId = b.businessId || b.id;
                const isSelected = targetId === business?.id;
                const isSwitching = switchingId === targetId;

                return (
                  <button
                    key={b.id || b.businessId}
                    type="button"
                    onClick={() => handleSelectBusiness(targetId)}
                    disabled={isSwitching}
                    className={`w-full text-left p-2.5 rounded-xl transition-colors flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#0F766E]/10 dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-[#14B8A6]'
                        : 'hover:bg-[#F4F8F7] dark:hover:bg-[#142B2A] text-[#123B3A] dark:text-[#F0FDFA]'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold truncate">{b.name}</span>
                        {isSelected && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-[#0F766E] text-white rounded font-medium">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#566B69] dark:text-[#8FA8A4]">
                        <span className="uppercase font-semibold">{b.role}</span>
                        {b.city && (
                          <span className="flex items-center gap-0.5">
                            • {b.city}
                          </span>
                        )}
                      </div>
                    </div>

                    {isSwitching ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#0F766E]" />
                    ) : isSelected ? (
                      <Check className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6] shrink-0" />
                    ) : null}
                  </button>
                );
              })
            ) : (
              // Fallback to active business if list API returned empty
              <div className="p-2.5 rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-between text-xs font-bold">
                <span>{business?.name || 'Default Store'}</span>
                <Check className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Footer Actions: Add Store or Upgrade */}
          <div className="p-2 border-t border-[#D7E5E2] dark:border-[#1E3B38] bg-[#F4F8F7]/50 dark:bg-[#142B2A]/50">
            {isLimitReached ? (
              <div className="p-2.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Free Starter: 2 Stores Max</span>
                </div>
                <p className="text-[11px] text-[#566B69] dark:text-[#8FA8A4] leading-tight">
                  Upgrade to Growth or Enterprise to unlock unlimited stores with shared login.
                </p>
                <Button
                  variant="primary"
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/account?tab=BILLING');
                  }}
                  className="w-full text-xs py-1.5 bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Upgrade to Unlock</span>
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsCreateModalOpen(true);
                }}
                className="w-full py-2 px-3 flex items-center justify-center gap-2 rounded-xl text-xs font-bold text-[#0F766E] dark:text-[#14B8A6] hover:bg-[#0F766E]/10 dark:hover:bg-[#0F766E]/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Store / Branch</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Create Store Modal */}
      <CreateStoreModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
};
